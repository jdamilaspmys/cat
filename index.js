const {writeFile} = require('fs');
const {join} = require('path');
const request = require('request');
const blend = require('@mapbox/blend');
const argv = require('minimist')(process.argv.slice(2));

// config
const SERVER_BASE_URL = 'https://cataas.com';

// Get Request 
const getRequest = (Req) => {
  return new Promise((resolve, reject) => {
    request.get(Req, (err, res, resBody) => {
      if (err) {
        reject(err);
      }
      return resolve(resBody);
    });
  });
};

// Image Get Method 
const getImage = ({imageText, width, height, color, size}) => {
  return getRequest({
    url: `${SERVER_BASE_URL}/cat/says/${imageText}?width=${width}&height=${height}&color${color}&s=${size}`,
    encoding: 'binary',
  });
};

// Image Merge Method
const mergeTwoImage = (img1, img2, width, height) => {
    return new Promise((resolve, reject) => {
        blend([{
            buffer: new Buffer.from(img1, 'binary'),
            x: 0,
            y: 0,
          }, {
            buffer: new Buffer.from(img2, 'binary'),
            x: width,
            y: 0,
          }], {
            width: width * 2,
            height: height,
            format: 'jpeg',
          }, (err, data) => {
              if(err){
                  return reject(err)
              }
              return resolve(data)
          });
    })
}

// Image Store Method 
const storeImage = (data, imageName) => {
  const fileOut = join(process.cwd(), imageName);
  writeFile(fileOut, data, 'binary', (err) => {
    if (err) {
      return;
    }
  });
};

// Main Program here
const main = async () => {
    console.log('........... Start Program ...................')
  try {
    const {
      width = 400,
      height = 500,
      color = 'Pink',
      size = 100,
    } = argv;
    const mergeImageName = '/cat-card.jpg'
    const imageOne = await getImage({imageText: 'Hello', width, height, color, size});
    console.log('Read file one')
    const imageTwo = await getImage({imageText: 'You', width, height, color, size});
    console.log('Read file two')
    const mergeImageData = await mergeTwoImage(imageOne, imageTwo, width, height);
    console.log('Two file was merged!')
    storeImage(mergeImageData, mergeImageName);
    console.log('The file was saved!');
    console.log('...........  End Program ...................')
  } catch (err) {
    console.error('Unable to process :(');
    console.error(err);
  }
};

main();
