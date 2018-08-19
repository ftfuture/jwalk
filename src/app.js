import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";
//import "../src/menu/menu.js"

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------
//
import { remote } from "electron";
import jetpack from "fs-jetpack";
import { greet } from "./hello_world/hello_world";
import env from "env";

const fs = require('fs');
const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
    win32: "Windows",
    darwin: "macOS",
    linux: "Linux"
};

const { dialog } = require('electron').remote;
const loadFileBtn = document.getElementById('load-file');

//var loadFileName = '/work/workspace/Electron/searchall/app/books.xml';
var loadFileName = "";
loadFileBtn.addEventListener('click', function(event) {
  dialog.showOpenDialog(function(fileNames) {
    if (fileNames === undefined) {
      console.log('No file selected.');
    } else {
      xmldata = "";
      document.getElementById('load-filename').innerText = fileNames[0];
      loadFileName = fileNames[0];
      //alert(fileNames[0]);
      //xmldata = fs.readFileSync(__dirname + '/sitemap.xml');
      xmldata = fs.readFileSync(loadFileName);
      xmldata = xmldata.toLocaleString();
      console.log(loadFileName);
    }
  });
});

const searchSubmitBtn = document.getElementById('search-submit');
searchSubmitBtn.addEventListener('click', function(event) {
  if (loadFileName === '') {
    alert('No file loaded.. load file first..');
    return;
  }
  console.log('start');

  testXmlDomParser();
});

var searchText = "";
var depth = 0;
var idx = 0;
var xmldata = "";
var nameData = "";
var valueData = "";
var resultBody = document.getElementById("resultTableBody");

function printAttributes(attributes) {
  var attributeData = "";
  for (var idx1 = 0; idx1 < attributes.length; idx1++) {
    attributeData += " name:" + attributes[idx1].nodeName + " value:" + attributes[idx1].nodeValue;
  }
  if (attributes.length)
    console.log(attributeData);
}

function printNode(node) {
  var parentPrintData, tempNode;
  parentPrintData = "";
  tempNode = node.parentNode;

  nameData = "";
  valueData = "";

  if (node.childNodes.length === 0 && node.attributes === undefined) return;
  while (tempNode != null && tempNode != undefined) {
    if (parentPrintData != "")
      parentPrintData = tempNode.nodeName + "-" + parentPrintData;
    else
      parentPrintData = tempNode.nodeName;

    tempNode = tempNode.parentNode;
  }

  if (node.childNodes.length !== 0) {
    console.log("Child(" + depth + ") - " + parentPrintData + " Name:" + node.nodeName + ",Value:" +
      node.childNodes[0].nodeValue + ", length:" + node.childNodes.length);
    nameData = parentPrintData + " - " + node.nodeName;
    valueData = node.childNodes[0].nodeValue;
  } else {
    console.log("Child(" + depth + ") - " + parentPrintData + " Name:" + node.nodeName + ", length:" + node.childNodes.length);
    nameData = parentPrintData + " - " + node.nodeName;
  }

  // add to table
  if((nameData != null && nameData.toLowerCase().indexOf(searchText.toLowerCase()) > -1)|| (valueData != null) && (valueData.toLowerCase().indexOf(searchText.toLowerCase())) > -1) {
    var rowData = document.createElement("tr");
    var cellData = document.createElement("td");
    var cellText = document.createTextNode(idx);
    cellData.appendChild(cellText);
    rowData.appendChild(cellData);
    cellData = document.createElement("td");
    cellText = document.createTextNode(nameData);
    cellData.appendChild(cellText);
    rowData.appendChild(cellData);
    cellData = document.createElement("td");
    cellText = document.createTextNode(valueData);
    cellData.appendChild(cellText);
    rowData.appendChild(cellData);
    resultBody.appendChild(rowData);
    idx++;
  }

  if (node.attributes !== null && node.attributes !== undefined) {
    //printAttributes(node.attributes);
    let attributes = node.attributes;
    var attributeData = "";
    for (var idx1 = 0; idx1 < attributes.length; idx1++) {
      //attributeData += " name:" + attributes[idx1].nodeName + " value:" + attributes[idx1].nodeValue;
      attributeData += attributes[idx1].nodeName + "/" + attributes[idx1].nodeValue + ",";
    }

    if (attributes.length){
      if(attributeData != undefined)
      if(attributeData.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
        //console.log(attributeData)
        rowData = document.createElement("tr");
        cellData = document.createElement("td");
        cellText = document.createTextNode(idx);
        cellData.appendChild(cellText);
        rowData.appendChild(cellData);
        cellData = document.createElement("td");
        cellText = document.createTextNode(nameData);
        cellData.appendChild(cellText);
        rowData.appendChild(cellData);
        cellData = document.createElement("td");
        cellText = document.createTextNode(attributeData);
        cellData.appendChild(cellText);
        rowData.appendChild(cellData);
        resultBody.appendChild(rowData);
        idx++;
      }
    }
  }
}

function printChildNode(node) {
  depth++;
  printNode(node);

  // if (node.childNodes.length == 1) {
  //     return;
  // }

  var childNodes = node.childNodes;
  for (var idx = 0; idx < childNodes.length; idx++) {
    //console.log("idx:" + idx);
    if (childNodes[idx].hasChildNodes !== undefined) printChildNode(childNodes[idx]);
    else console.log("Name:" + childNodes[idx].nodeName + ",Value:" + childNodes[idx].nodeValue);
  }
  depth--;
}
//check if the first node is an element node
function get_firstChild(n) {
  var y = n.firstChild;
  while (y.nodeType != 1) {
    y = y.nextSibling;
  }
  return y;
}

function get_lastChild(n) {
  var y = n.lastChild;
  while (y.nodeType != 1) {
    y = y.previousSibling;
  }
  return y;
}

function get_nextSibling(n) {
  var y = n.nextSibling;
  //check if the node is an element node
  while (y.nodeType != 1) {
    y = y.nextSibling;
  }
  return y;
}

function myFunction(xml) {
  var x, y, i, xlen, xmlDoc, txt;
  xmlDoc = xml.responseXML;
  x = xmlDoc.getElementsByTagName("book")[0];
  xlen = x.childNodes.length;
  y = x.firstChild;
  txt = "";
  for (i = 0; i < xlen; i++) {
    if (y.nodeType == 1) {
      txt += i + " " + y.nodeName + "<br>";
    }
    y = y.nextSibling;
  }
  document.getElementById("demo").innerHTML = txt;
}

function testXmlDomParser() {
  console.log("testXmlDomParser");

  var text = "<language><name>HTML</name>" +
    "<category>web</category>" +
    "<priority>high</priority>" +
    "<item>11111</item>" +
    "<item2><item3>22222</item3><item4>3333</item4></item2>" +
    "<standard version='5.1'>W3C</standard></language>";

  const xml1 =
    `<message id="1001" date="2016-06-19">
    <from>Bob</from>
    <to>Alice</to>
    <subject id="2002" date="2016-02-22">Hello</subject>
    <body>Bla bla bla</body>
    <end id="3002" date="2016-03-22"/>
    </message>`;

  // fs.readFile(__dirname + '/sitemap.xml', 'utf8', function(err, data){
  //   var i=0;
  //   if(err) throw err;
  //   if(!err) {
  //     xmldata = data;
  //     console.log(i+" - "+JSON.stringify(data));
  //   }
  //   i++;
  // });

  var re = new RegExp("<url>(?:(?!<article)[\\s\\S])*</url>", "gmi");
  //xmldata = xmldata.replace(re, ""); // remove node not containing article node
  console.log(xmldata.toLocaleString());

  var xmlParser = new DOMParser();
  var xmlDoc = xmlParser.parseFromString(xmldata, "text/xml");
  //var nodeList = xmlDoc.documentElement.childNodes;
  searchText = document.getElementById("searchText").value;
  console.log("search text - " + searchText);
  //document.getElementById('load-filename').xml = xmlDoc;
  console.log("Root Name:" + xmlDoc.documentElement.nodeName + ",Value:" + xmlDoc.documentElement.nodeValue + ",count(" + xmlDoc.documentElement.childNodes.length + ")");
  if (xmlDoc.documentElement.hasChildNodes) printChildNode(xmlDoc.documentElement);

  // for (var idx = 0; idx < nodeList.length; idx++) {
  //     console.log(nodeList[idx].nodeName);
  //     if (nodeList[idx].hasChildNodes()) console.log("has child");
  //     //if(nodeList[idx].nodeType )
  // }
  // document.getElementById("text").innerHTML = "첫 번째 name 요소의 텍스트 값은 " +
  //     xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue + "입니다.";
  // console.log("첫 번째 name 요소의 텍스트 값은 " +
  //     xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue + "입니다.");

  //var nodeList = xmlDoc.evaluate("descendant::*", xmlDoc, null, XPathResult.ANY_TYPE, null);
  //var nodeList = xmlDoc.evaluate("//*", xmlDoc, null, XPathResult.ANY_TYPE, null);
  //var node = nodeList.iterateNext();
  // console.log(nodeList.stringValue);
  // return;
  // var result;
  // while (node) {
  //     //console.log(node.firstChild.nodeName + ":" + node.firstChild.nodeType + ":" + node.firstChild.nodeValue);
  //     console.log(node.nodeName);
  //     node = nodeList.iterateNext();
  // }
}


// document.querySelector("#app").style.display = "block";
// document.querySelector("#greet").innerHTML = greet();
// document.querySelector("#os").innerHTML = osMap[process.platform];
// document.querySelector("#author").innerHTML = manifest.author;
// document.querySelector("#env").innerHTML = env.name;
// document.querySelector("#electron-version").innerHTML = process.versions.electron;
