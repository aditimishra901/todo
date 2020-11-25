const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

const items = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aditi:test123@cluster0.403sd.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Sleep"
});
const item2 = new Item({
  name: "Eat"
});
const item3 = new Item({
  name: "Shop"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItem: foundItems
      });



    }


  });


});

app.get("/:customListname", function(req, res) {
  const customListname =_.capitalize (req.params.customListname);



List.findOne({name:customListname},function(err,foundList){
  if(err)
  {
    console.log(err);
  }
  else {
    if(foundList)
    {
    // show an existing list
    res.render("list",{listTitle: foundList.name, newListItem:foundList.items});
  }
  else {
    // create a new list
    const list = new List({
      name: customListname,
      items: defaultItems
    });
    list.save();
    res.redirect("/"+customListname);
  }
}
});

});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }



});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }




});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "")
{
  port = 3000;
}


app.listen(port, function() {
  console.log("Server is running on port 3000");
});
