import './style.css'
import { PROJECT_ID, DATABASE_ID, COLLECTION_ID, BUCKET_ID } from './shhh.js';
import { format } from 'date-fns';
import { Client, Databases, ID, Storage, ImageGravity, ImageFormat } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);

// const promise = storage.createFile(
//   BUCKET_ID,
//   ID.unique,
//   document.getElementById('uploader').files[0]
// );

// promise.then(function (response) {
//   console.log(response);
// }, function (error) {
//   console.log(error);
// });

const form = document.querySelector('form')
const uploader = document.getElementById('uploader');

uploader.addEventListener('change', handleFileUpload)

form.addEventListener('submit', addJob)

// IMAGE PREVIEW????
const img = storage.getFilePreview(
  BUCKET_ID,
  ID.unique,
  0,
  0,
  ImageGravity.Center,
  0,
  0,
  '',
  0,
  0,
  -360,
  '',
  ImageFormat.jpg
);


async function addJob(e){
  e.preventDefault()
  handleFileUpload()
  const job = databases.createDocument(
    DATABASE_ID,
    COLLECTION_ID,
    ID.unique(),
    { "date-added":  e.target.dateAdded.value,
      "hold-time": e.target.holdTime.value,
      "distance-steps":  e.target.distanceSteps.value,
     }
  );
  job.then(function (response) {
      addJobsToDom()
  }, function (error) {
      console.log(error);
  });
  form.reset()
}

async function handleFileUpload() {
  const fileInput = document.getElementById('uploader');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];

    try {
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );

      console.log('file uploaded:', response);
    } catch (error) {
      console.error('error uploading:', error);
    }
  }
}

async function addJobsToDom(){
    document.querySelector('ul').innerHTML = ""
    let response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID
  );
//ADDED MORE IMG STUFF BELOW
  response.documents.forEach((job)=>{
    const formattedDate = format(new Date(job['date-added']), 'MMM d, yyyy');

    const li = document.createElement('li');
    li.textContent = `${formattedDate} || ${job['distance-steps']} steps || ${job['hold-time']} seconds`
    li.id = job.$id

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'remove'
    deleteBtn.onclick = () => removeJob(job.$id)
    li.appendChild(deleteBtn)
//MORE PHOTO CODE BELOW
    if (job.$file) {
      storage.getFilePreview(BUCKET_ID, job.$file)
      .then(response => {
        const img = document.createElement('img');
        img.src=response.url
        li.appendChild(img);
        const galleryImage = document.querySelector('.gallery img');
        galleryImage.src = response.url;
        // `https://cloud.appwrite.io/v1/storage/buckets/handstand_photos/files/${file}` 
      })

      .catch(error => {
        console.error('error getting image:', error);
      });
    }

    document.querySelector('ul').appendChild(li)
  })

  async function removeJob(id){
    const result = await databases.deleteDocument(
      DATABASE_ID, 
      COLLECTION_ID, 
      id 
    );
    document.getElementById(id).remove()
  
  }
  async function updateChat(id){
    const result = databases.updateDocument(
      DATABASE_ID, 
      COLLECTION_ID, 
      id
    );
    result.then(function(){location.reload()})
  }

}
addJobsToDom()
