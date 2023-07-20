//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sejalverma67277:holo1234@cluster0.kwtf8ou.mongodb.net/todolistDB");

const todoSchema= new mongoose.Schema ({
name: String
});

const Item = mongoose.model("Item", todoSchema);

const Item1 = new Item({
  name: "cook food"
});

const Item2 = new Item({
  name: "study"
});

const Item3 = new Item({
  name: "take a break"
});

const Defaultitems = [Item1 , Item2,Item3];

const listschema = new mongoose.Schema({
  name : String,
  items : [todoSchema]
});
  
const List = mongoose.model("List",listschema);



app.get("/", function(req, res) {

async function getitems() {
  const result =  await Item.find();

  if(result.length === 0){
    Item.insertMany(Defaultitems);
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: result});
  }
  
}

getitems();
});

app.get("/:name", async function(req, res){
const customroute = _.capitalize(req.params.name);

const ob = await List.findOne({name: customroute});
if (ob){
  res.render("list", {listTitle: ob.name, newListItems: ob.items});
}else{
const list = new List({
name : customroute,
items: Defaultitems
});
res.redirect("/");
list.save();

}








});



app.post("/", async function(req, res){

  const itemName= req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
if (listName === "Today"){
  item.save();
  res.redirect("/");
}else{
const customlistname = await List.findOne({name: listName});
customlistname.items.push(item);
customlistname.save();
res.redirect("/" + listName);
}
  

  
});

app.post("/delete",async function(req,res){
const checkeditembyid = req.body.checkbox;
const listname = req.body.listName;

if(listname === "Today"){
  
const tem = await Item.findByIdAndRemove(checkeditembyid);
console.log(tem);

  res.redirect("/");
}else{
await List.findOneAndUpdate({name: listname},{$pull: {items:{_id: checkeditembyid}}});
res.redirect("/" + listname);
}


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
