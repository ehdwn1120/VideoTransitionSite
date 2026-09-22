import test from 'node:test';
import assert from 'node:assert/strict';
import {detectMedia, imageDimensions, MAX_VIDEO_BYTES} from '../src/modules/media.js';
test('Media routing, limits and proportional image sizing', () => {
 for (const name of ['photo.JPG','a.jpeg','a.png','a.webp']) assert.equal(detectMedia({name,size:10}),'image');
 for (const name of ['a.mp4','a.webm','a.mov','a.mkv','a.m4v','a.avi','a.AVI']) assert.equal(detectMedia({name,size:10}),'video');
 for (const name of ['a.gif','a.heic','a.avif','a.svg']) assert.throws(()=>detectMedia({name,size:10}));
 assert.throws(()=>detectMedia({name:'a.png',size:0}));
 assert.throws(()=>detectMedia({name:'a.png',size:201*1024*1024}));
 assert.deepEqual(imageDimensions(1200,800,'480'),{width:720,height:480});
 assert.deepEqual(imageDimensions(200,100,'480'),{width:200,height:100});
 assert.deepEqual(imageDimensions(600,1200,'480'),{width:240,height:480});
});

test('Video 1.1GB boundary is separate from image limit',()=>{
 assert.equal(detectMedia({name:'large.avi',size:MAX_VIDEO_BYTES}),'video');
 assert.throws(()=>detectMedia({name:'large.avi',size:MAX_VIDEO_BYTES+1}),/1.1GB/);
 assert.throws(()=>detectMedia({name:'large.png',size:201*1024**2}),/200MB/);
});
