var express = require("express");
var app = express();
var mongodb = require ("mongodb");
var bodyParser = require("body-parser");
var path = require("path");
var http = require("http");
var fs = require("fs");

var database = mongodb.MongoClient.connect("mongodb://localhost/requests");

var idRequest;
var cID;
var dID;
var nbID;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, 'Home')));
app.use(express.static(path.resolve(__dirname, 'Login')));
app.use(express.static(path.resolve(__dirname, 'Contact')));
app.use(express.static(path.resolve(__dirname, 'About')));
app.use(express.static(path.resolve(__dirname, 'Delivery')));
app.use(express.static(path.resolve(__dirname, 'Main')));
app.use(express.static(path.join(__dirname, 'Users')));
app.use(express.static(path.join(__dirname, 'Checkout')));

app.get("/", function(req,res){
  res.sendFile('index.html', {root:path.join(__dirname,'./Home')});
});

app.get("/Users", function(req,res){
  res.sendFile('users.json', {root:path.join(__dirname,'./Users')});
});

app.get("/CustomerRequests", function(req,res){
  res.sendFile('customerrequests.json', {root:path.join(__dirname,'./CustomerRequests')});
});

app.get("/TrackPackage", function(req,res){
  res.sendFile('trackpackage.json', {root:path.join(__dirname,'./TrackPackage')});
});

app.get("/SentPackages", function(req,res){
  res.sendFile('sentpackages.json', {root:path.join(__dirname,'./SentPackages')});
});

app.get("/DeliveryRequests", function(req,res){
  res.sendFile('deliveryrequest.json', {root:path.join(__dirname,'./DeliveryRequests')});
});

app.get("/DeliveryPending", function(req,res){
  res.sendFile('deliverypending.json', {root:path.join(__dirname,'./DeliveryPending')});
});

app.get("/Delivered", function(req,res){
  res.sendFile('delivered.json', {root:path.join(__dirname,'./Delivered')});
});

app.post('/login.html', function(req,res){
      res.sendFile('login.html', {root:path.join(__dirname,'./Login')});
});

app.post('/contact.html', function(req,res){
      res.sendFile('contact.html', {root:path.join(__dirname,'./Contact')});
});

app.post('/about.html', function(req,res){
      res.sendFile('about.html', {root:path.join(__dirname,'./About')});
});

app.post('/main.html', function(req,res){
      cID = req.body.idcustomer;
      console.log(cID);
      res.redirect('/customerpage');
});

app.get('/customerpage', function(req,res){
  database.then(function(db){

    db.collection('deliveryrequests').find({CustomerID:cID, Status:"Odelivery"}).toArray(function(err,results){
            if(err){
              console.log("Error "+err);
              }else{
                var myJSON = JSON.stringify(results);
                console.log(myJSON);
                 var write = fs.createWriteStream('TrackPackage/trackpackage.json');
                 write.write(myJSON);
                res.sendFile('main.html', {root:path.join(__dirname,'./Main')});
              }
          });


          db.collection('deliveryrequests').find({CustomerID:cID, Status:"Delivered"}).toArray(function(err,results){
                  if(err){
                    console.log("Error "+err);
                    }else{
                      var myJSON = JSON.stringify(results);
                      console.log(myJSON);
                       var write = fs.createWriteStream('SentPackages/sentpackages.json');
                       write.write(myJSON);
                       res.sendFile('main.html', {root:path.join(__dirname,'./Main')});
                    }
                });
  });
});



app.post('/delivery.html', function(req,res){
  dID = req.body.iddelivery;
  nbID = req.body.nbdelivery;
  console.log(typeof dID),
  console.log(dID);
  console.log(typeof nbID),
  console.log(nbID);
  res.redirect('/deliverypage');
});


app.get('/deliverypage', function(req,res){

  database.then(function(db){

    db.collection('deliveryrequests').find({Status:"Pending"}).toArray(function(err,results){
            if(err){
              console.log("Error "+err);
            }else{
              var myJSON = JSON.stringify(results);
              var write = fs.createWriteStream('DeliveryRequests/deliveryrequest.json');
              write.write(myJSON);
              res.sendFile('delivery.html', {root:path.join(__dirname,'./Delivery')});
              }
          });


      db.collection('deliveryrequests').find({Status:"Delivered", DeliveryID:dID}).toArray(function(err,results){
              if(err){
                console.log("Error "+err);
              }else{
                var myJSON = JSON.stringify(results);
                var write = fs.createWriteStream('Delivered/delivered.json');
                write.write(myJSON);
                res.sendFile('delivery.html', {root:path.join(__dirname,'./Delivery')});
                    }
                });

      db.collection('deliveryrequests').find({Status:"Odelivery",DeliveryID:dID}).toArray(function(err,results){
              if(err){
                console.log("Error "+err);
              }else{
                var myJSON = JSON.stringify(results);
                var write = fs.createWriteStream('DeliveryPending/deliverypending.json');
                write.write(myJSON);
                res.sendFile('delivery.html', {root:path.join(__dirname,'./Delivery')});
          }
      });
    });
});


app.post('/acceptrequests', function(req,res){

  var acceptedID = req.body.reqIDselected;

  console.log(" accepted requests "+ acceptedID);
  if (acceptedID.length!=0){
  var fields = acceptedID.split(",");
  console.log(typeof fields);
  var newStatus = {$set: {Status:"Odelivery", DeliveryID:dID, DeliveryNb:nbID}};
  var accID;

    database.then (function (db){
      for (aID in fields){
        var objectId = mongodb.ObjectId(fields[aID]);
        accID =  { _id:objectId};
        database.then (function (db){
          db.collection('deliveryrequests').updateOne(accID,newStatus, function(error,result){
            if(error){
              console.log("error");
            }else{
              console.log("updated");
              res.redirect(req.get('referer'));
          }
        });
    });
  }
});

}else{
  res.redirect(req.get('referer'));
}

});


app.post('/statusrequests', function(req,res){
  var deliveredID = req.body.statusIDselected;
  console.log("delivered requests "+ deliveredID);
  if (deliveredID.length !=0){
    var deliveredfields = deliveredID.split(",");
    var newDeliveredStatus = {$set: {Status:"Delivered"}};
    var accID;

    console.log(deliveredfields);

    database.then (function (db){
      for (aID in deliveredfields){
        var objectId = mongodb.ObjectId(deliveredfields[aID]);
        accID =  { _id:objectId};
        database.then (function (db){
          db.collection('deliveryrequests').updateOne(accID,newDeliveredStatus, function(error,result){
            if(error){
              console.log("error");
            }else{
              console.log("updated");
               res.redirect(req.get('referer'));
            }
        });
      });
    }
});

}else{
  res.redirect(req.get('referer'));
}

});



app.post('/createrequest', function(req,res){
  var requestinfo={
    type : req.body.type,
    place : req.body.place,
    pickup : req.body.pickup,
    dropoff : req.body.dropoff,
    contactnumber : req.body.contactnumber,
    cost : req.body.cost,
    comments : req.body.comments,
    CustomerID : req.body.CustomerID,
    DeliveryID : req.body.DeliveryID,
    DeliveryNb : req.body.DeliveryNb,
    Status : req.body.Status
  };

  if (requestinfo.pickup!="" && requestinfo.dropoff!=""){


  database.then (function (db){
    db.collection('deliveryrequests').insertOne(requestinfo, function(error,result){
      if(error){
        console.log("error");
      }else{
        console.log("added");
        console.log(requestinfo._id);
        idRequest = requestinfo._id;


        res.redirect('/checkout');
      }
        });
});
}else {
  res.redirect(req.get('referer'));
}
});

app.get('/checkout', function(req,res){
  console.log("get method");
  console.log(typeof idRequest);
  database.then(function (db){
    db.collection('deliveryrequests').find({_id:idRequest}).toArray(function(err,results){
            if(err){
              console.log("Error ");
              }else{
                var myJSON = JSON.stringify(results);
                  var write = fs.createWriteStream('CustomerRequests/customerrequests.json');
                  write.write(myJSON);
                 res.sendFile('checkout.html', {root:path.join(__dirname,'./Checkout')});
              }
        });
});
});


app.post('/saveRequest', function(req,res){
  var reqComments=req.body.comments;
  var newComment = {$set: {comments:reqComments}};
  var iRequest = { _id: idRequest };
  database.then (function (db){
    db.collection('deliveryrequests').updateOne(iRequest,newComment, function(error,result){
      if(error){
        console.log("error");
      }else{
        console.log("updated");
        res.sendFile('main.html', {root:path.join(__dirname,'./Main')});

      }
        });
});
});

app.post('/cancelRequest', function(req,res){

  var iRequest = { _id: idRequest };
  database.then (function (db){
    db.collection('deliveryrequests').deleteOne(iRequest, function(error,result){
      if(error){
        console.log("error");
      }else{
        console.log("deleted");

        res.sendFile('main.html', {root:path.join(__dirname,'./Main')});

      }
        });
});
});




app.listen(3000, function(){
  console.log("server is running on 3000");
});
