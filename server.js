const mongo = require("mongodb").MongoClient();
const express = require("express");
const https = require("https");
const HOME = "https://image-search-dxstone.c9users.io/"

var app = express();
var key = 'U1VJSUp5aGUydTZ5RlowNkQzUHRtRUg3WmJ4Y3VOb2JpMVFyYlRFb0I2NDpTVUlJSnloZTJ1NnlGWjA2RDNQdG1FSDdaYnhjdU5vYmkxUXJiVEVvQjY0'
var recent = [];

var jsonFormatPath = "&$format=JSON";

function createLink(src,display) {
    return "<a href='" + src + "'>" + display + "</a>";
    }

app.get("/recent", function(req,res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    recent.forEach(function(entry) {
        entry.search = createLink(HOME + "api/" + entry.search, entry.search);
    });
    res.end("<pre><code>" + JSON.stringify(recent,null,2) + "</code></pre>");
});

app.get("/api/*",function(req,res) {
    
    var offset = req.query.offset ? "&$skip=" + req.query.offset : "";
    var resultsObject = {results:[]};
    

    
    function parseResponse(data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write("<pre><code>");
        var resultsArray = JSON.parse(data).d.results;
        resultsArray.forEach(function(entry) {
            resultsObject.results.push({
                title: entry.Title
                , image_link: createLink(entry.MediaUrl,entry.MediaUrl)
                , page_link: createLink(entry.SourceUrl,entry.SourceUrl)
            });
        });
        res.end(JSON.stringify(resultsObject,null,2) + "</code></pre>");
    }
    
    var searchString = "'" + req.url.slice(5).split("?")[0] +"'";
    
    recent.push({search: req.url.slice(5), time: new Date(Date.now()).toString()});
    if (recent.length>10) {recent.unshift();}
    
    var options = {
            headers : {
                "Authorization": 'Basic ' + key
            },
            host: 'api.datamarket.azure.com',
            path: "/Data.ashx/Bing/Search/v1/Image?Query=",
  
        };
        
    options.path += searchString + jsonFormatPath + "&$top=20" + offset;
    https.request(options, function(httpsResponse) {
        var str = "";
        
        httpsResponse.on("data",function(chunk) {
            str+=chunk;
        });
        
        httpsResponse.on("end",function() {
            parseResponse(str);
        });
        
    }).end();
});

app.listen(process.env.PORT || 8080, function() {
    console.log("Listening on 8080");
});

