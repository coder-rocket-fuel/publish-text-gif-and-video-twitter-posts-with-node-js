//https://github.com/desmondmorris/node-twitter/tree/master/examples#tweet

const Twitter = require("twitter")
const dotenv = require("dotenv")

dotenv.config()

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

//tweet with only text
function publishTextPost() {
  client.post("statuses/update", { status: "I tweeted from Node.js!" }, function(error, tweet, response) {
    if (error) {
      console.log(error)
    } else {
      console.log(tweet)
    }
  })
}

//tweet with image
  //upload image
  //post tweet including image
const imageData = require("fs").readFileSync("./media/george.jpg")

function publishImagePost() {
  client.post("media/upload", {media: imageData}, function(error, media, response) {
    if (error) {
      console.log("media upload")
      console.log(error)
    } else {
      console.log(media)

      const status = {
        status: "Tweet text.",
        media_ids: media.media_id_string
      }

      client.post("statuses/update", status, function(error, tweet, response) {
        if (error) {
          console.log(error)
        } else {
          console.log(tweet)
        }
      })
    }
  })
}

//tweet with gif or mp4 video
const pathToGif = "./media/homer.gif"
const pathToVideo = "./media/test.mp4"

const mediaType = "video/mp4" //change to "image/gif" for a gif file

const mediaData = require("fs").readFileSync(pathToVideo)
const mediaSize = require("fs").statSync(pathToVideo).size

initializeMediaUpload()
  .then(appendFileChunk)
  .then(finalizeUpload)
  .then(publishStatusUpdate)

function initializeMediaUpload() {
  return new Promise(function(resolve, reject) {
    client.post("media/upload", {command: "INIT", total_bytes: mediaSize, media_type : mediaType}, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(data.media_id_string)
      }
    })
  })
}

function appendFileChunk(mediaId) {
  return new Promise(function(resolve, reject) {
    client.post("media/upload", {command: "APPEND", media_id: mediaId, media: mediaData, segment_index: 0}, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}

function finalizeUpload(mediaId) {
  return new Promise(function(resolve, reject) {
    client.post("media/upload", {command: "FINALIZE", media_id: mediaId}, function(error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}

function publishStatusUpdate(mediaId) {
  const status = {
    status: "Homer gif from Node.js.",
    media_ids: mediaId
  }

  client.post("statuses/update", status, function(error, data, response) {
    if (error) {
      console.log(error)
      reject(error)
    } else {
      console.log("Successfully uploaded media and tweeted.")
      return data
    }
  })
}
