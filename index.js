let express = require("express")
let app = express();
var videoshow = require('videoshow')
const request = require('request');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const path = require("path")
app.use(express.urlencoded())
app.use(express.json())
var images = [];
var nametruyen ;
app.get("/" , (req , res) => {
  console.log(__dirname)
   res.sendFile( __dirname + "/index.html")
})
app.post( "/" , async (req , res) => {
     var options = {
      url: req.body.link ,
      method: 'GET', 
      headers: {
        'User-Agent': 'Super Agent/0.0.1' , 
        'Content-Type' : 'application/x-www-form-urlencoded'
      } , 
      qs:{'key1' :  'xxx' , 'key2': 'yyy'}
    };
    var ds ;
    var name;
    var html = '';
    var index = 0;
    var arr = []
    var indexS = 0;
    request(options, async function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
         ds = $(body).find(".main_img");
         name = $(body).find("h2#ContentPlaceDetail_mH2_NameChapter");
         name.each(function(i ,e ) {
           nametruyen =  e["children"][0].data
         })
         ds.each(function(i , e){
         html += `<p>${e["attribs"]["src"]}</p> <br>`;
         arr.push(e["attribs"]["src"]);
        })
        var  interval = 3000; //one second
        await ( async () => {
          arr.forEach( async (item , index) => {
            setTimeout(async () => {
              const browser = await puppeteer.launch();
              const page = await browser.newPage();
              await page.goto(item);
              await page.screenshot({ path: path.join(__dirname , `upload/example${index}.png`)});
              if(index == 1 ){
                var obj =  { path: 'upload/example'+index +'.png' , caption : nametruyen}
              }
              var obj =  { path: 'upload/example'+index +'.png'}
              images.push(obj);
              await browser.close();
              console.log(images.length , arr.length)
              if(images.length == arr.length) {
                res.redirect('/getvideo')
              };
            }, index * interval)
          })
        })();
      }
   })
})
app.get("/getvideo" , (req , res) =>  {
  console.log(images);
    var videoOptions = {
      fps: 24,
      loop: 5, // seconds
      transition: false,
      transitionDuration: 1, // seconds
      videoBitrate: 1024,
      videoCodec: 'libx264',
      size: '1280x?',
      audioBitrate: '128k',
      audioChannels: 2,
      format: 'mp4',
      pixelFormat: 'yuv420p'
    }
    videoshow(images, videoOptions)
      .save('test.mp4')
      .on('start', function (command) {
        console.log('ffmpeg process started:')
      })
      .on('error', function (err, stdout, stderr) {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
      })
      .on('end', function (output) {
        console.error('Video' + nametruyen + "Da Thanh cong" )
        // res.download("./test.mp4");
      })
})
app.get("/download" , (req , res) =>  {
  // res.download("./test.mp4");
})
app.listen(process.env.PORT || 8080  , () => {
    console.log("server connect " + process.env.PORT);
})