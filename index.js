const fs = require("fs");
const axios = require("axios");
const inquirer = require("inquirer");
const HTML5ToPDF = require("html5-to-pdf")
const path = require("path")

inquirer
  .prompt([{
    message: "Enter your GitHub username:",
    name: "username"
  },
  {
    type: "input",
    message: "What is your favorite color?",
    name: "color"
  }])
  .then(function(response) {
    const queryUrl = `https://api.github.com/users/${response.username}`;
    axios.get(queryUrl).then(function(res) {
      const colorName = response.color;
      const id = res.data.id;
      const profileImg = res.data.avatar_url;
      const userName = res.data.login;
      const profileUrl = res.data.html_url;
      const userBlog = res.data.blog;
      const userBio = res.data.bio;
      const publicRepos = res.data.public_repos;
      const followers = res.data.followers;
      const following = res.data.following;
      const userLocation = res.data.location;
      //profile image breaks pdf rendering; tried sep <div> in header, footer, iframe, modal, needs URI vs URL
      return htmlStr = `
<!DOCTYPE html>
<html>
<head>
    <title>jsPDF</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<style>
		@CHARSET "UTF-8";
		.page-break {
			page-break-after: always;
			page-break-inside: avoid;
			clear:both;
		}
		.page-break-before {
			page-break-before: always;
			page-break-inside: avoid;
			clear:both;
		}
  </style>
  </head>
<body style='background-color: ${colorName}';>
<button onclick="generate()" style='color: blue';>Click to Generate PDF</button>
    <div id="html-2-pdfwrapper" style='position: absolute; left: 20px; top: 50px; bottom: 0; overflow: auto; width: 600px;'>
    <h1>Html2Pdf: <br /> Save & Print GitHub Profile</h1>
        <div>Welcome to <span class="username">${userName}</span>'s GitHub Information</div>
        <div><a href="${profileUrl}">Click here</a> to visit ${userName}'s GitHub profile.</div>
        <div><a href="${profileImg}">Click for Avatar</a></div>


    <div class="left">
      <h3>About <span class="username">${userName}</span>: </h3>
      <div>Location: <a href="https://www.google.com/maps/place/${userLocation}">${userLocation}</a></div>
      <div>Personal Site: <a href="${userBlog}">Click Here.</a></div>
      <div>Bio: ${userBio}</div>
    </div>
    <div class="left">
    <h3>About <span class="username">${userName}</span>'s GitHub profile: </h3>
    <div>Number of public repositories: ${publicRepos} </div>
    <div>Number of followers: ${followers} </div>
    <div>Number following: ${following} </div>
    <div>Number of GitHub stars: </div>		
		
</div>
<script src='dist/jspdf.min.js'></script>
<script>
var base64Img = null;
imgToBase64('octocat.jpg', function(base64) {
    base64Img = base64; 
});
margins = {
  top: 70,
  bottom: 40,
  left: 30,
  width: 550
};
generate = function()
{
    var pdf = new jsPDF('p', 'pt', 'a4');
	pdf.setFontSize(18);
	pdf.fromHTML(document.getElementById('html-2-pdfwrapper'), 
		margins.left, // x coord
		margins.top,
		{
			// y coord
			width: margins.width// max width of content on PDF
		},function(dispose) {
		}, 
		margins);
		
	var iframe = document.createElement('iframe');
	iframe.setAttribute('style','position:absolute;right:0; top:0; bottom:0; height:100%; width:650px; padding:20px;');
	document.body.appendChild(iframe);
	
	iframe.src = pdf.output('datauristring');
};
function headerFooterFormatting(doc, totalPages)
{
    for(var i = totalPages; i >= 1; i--)
    {
        doc.setPage(i);                            
        //header
        header(doc);
        
        footer(doc, i, totalPages);
        doc.page++;
    }
};
function header(doc)
{
    doc.setFontSize(30);
    doc.setTextColor(40);
    doc.setFontStyle('normal');
	
    if (base64Img) {
       doc.addImage(base64Img, 'JPEG', margins.left, 10, 40,40);        
    }
	    
    doc.text("Report Header Template", margins.left + 50, 40 );
	doc.setLineCap(2);
	doc.line(3, 70, margins.width + 43,70); // horizontal line
};
function imgToBase64(url, callback, imgVariable) {
 
    if (!window.FileReader) {
        callback(null);
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
			imgVariable = reader.result.replace('text/xml', 'image/jpeg');
            callback(imgVariable);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
};
function footer(doc, pageNumber, totalPages){
    var str = "Page " + pageNumber + " of " + totalPages
   
    doc.setFontSize(10);
    doc.text(str, margins.left, doc.internal.pageSize.height - 20);
    
};
 </script>
</body>
</html>
`;
;
})
.then(htmlStr => {
  fs.writeFile("index.html", htmlStr, () => {
  });
})
.then(() => {
  /* read the file from filesystem */
  /* convert to pdf */
  const run = async () => {
    const html5ToPDF = new HTML5ToPDF({
      inputPath: path.join(__dirname, "index.html"),
      outputPath: path.join(__dirname, "great.pdf"),
      options: { printBackground: true }
    });
    await html5ToPDF.start();
    await html5ToPDF.build();
    await html5ToPDF.close();
    console.log("DONE");
    process.exit(0);
  };
  return run();
});
});