//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jeremy:Test123@cluster0.2demzng.mongodb.net/todolistDB", {useNewUrlParser: true});
 
//Created Schema
const itemsSchema = new mongoose.Schema({
  name: String
});
 
//Created model
const Item = mongoose.model("Item", itemsSchema);
 
//Creating items
const item1 = new Item({
  name: "Welcome to your todo list."
});
 
const item2 = new Item({
  name: "Hit + button to create a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
 
//Storing items into an array
const defaultItems = [item1, item2, item3];
 
//In latest version of mongoose insertMany has stopped accepting callbacks
//instead they use promises(Which Angela has not taught in this course)
//So ".then" & "catch" are part of PROMISES IN JAVASCRIPT.
 
//PROMISES in brief(If something is wrong please correct me):
//In JS, programmers encountered a problem called "callback hell", where syntax of callbacks were cumbersome & often lead to more problems.
//So in effort to make it easy PROMISES were invented.
//to learn more about promise visit : https://javascript.info/promise-basics
//Or https://www.youtube.com/watch?v=novBIqZh4Bk
 
 
app.get("/", function(req, res) {

  Item.find({},)
  .then(function(foundItems){

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Successfully saved into our DB.");
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }})
    .catch(function(err){
    console.log(err);
  });
 
 
});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });
 
  if (listName === "Today"){
  item.save()
  .then(function(){
  console.log("Successfully saved into DB");
  })
  .catch(function(err){
  console.log(err);
  });
  res.redirect("/");
  } else {
    List.findOne({name: listName}) 
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/"+listName);
}});

app.post("/delete", function(req, res){
 
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
 
  if(listName === "Today") {
 
    Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
 
    res.redirect("/");
 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
      {
        res.redirect("/" + listName);
      });
  }
});

 
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
})
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
 
