var MongoC = require ('mongodb').MongoClient;
var mongoclient = new MongoC();
mongoclient.connect ("mongodb://localhost/",function(err,db){
  if (err)
    throw err;
  var requests = db.db ("requests");
  var drequests=[

    {"type":"Parcel", "place":"AcrossC","pickup":"Abu Dhabi Campus, Engineering Building, CSIT Department, Office Nb. 1f45", "dropoff": "Main Building, Registration Office, Nb. 102", "contactnumber":"050125348", "cost":"N\A","comments":"N\A", "CustomerID":"1011330", "DeliveryID":"2000001", "DeliveryNb":"0501234567", "Status":"Odelivery"},

    {"type":"transcript", "place":"outsideE","pickup":"Abu Dhabi Campus, Main Building, Registration Office", "dropoff": "Dubai Campus, Second Floor, Registration Office, Nb. 302", "contactnumber":"0563997538", "cost":"30AED","comments":"Please confirm that the package has been sent.", "CustomerID":"1072928", "DeliveryID":"N\A", "DeliveryNb":"N\A", "Status":"Pending"},

    {"type":"University ID", "place":"AcrossC","pickup":"Abu Dhabi Campus, Student Affairs, Office Nb. 14", "dropoff": "Main Building Entry", "contactnumber":"0526547892", "cost":"N\A","comments":"Before going out for delivery please call.", "CustomerID":"1053284", "DeliveryID":"2000003", "DeliveryNb":"0502341523", "Status":"Odelivery"}
];

  requests.createCollection("deliveryrequests", function(err, collection){
    collection.insertMany(drequests, function(err,result){
      if(err){
        console.log("Failed to add");
      }else{
        console.log("Success");
      }
    });
 });
});
