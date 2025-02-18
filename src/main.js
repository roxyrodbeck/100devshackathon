import './style.css'
import { PROJECT_ID, DATABASE_ID, COLLECTION_ID, BUCKET_ID } from './shhh.js';
import { format } from 'date-fns';
import { Client, Databases, ID, Storage } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);
const form = document.querySelector('form')
const uploader = document.getElementById('uploader');

uploader.addEventListener('change', handleFileUpload)


form.addEventListener('submit', addJob)


async function addJob(e){
  e.preventDefault()
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
      location.reload();
    } catch (error) {
      console.error('error uploading:', error);
    }
  }
}

async function uploadedPhotos() {
  try {
    const result = await storage.listFiles(
      BUCKET_ID
    );
    console.log('Files:', result.files);

    const gallery = document.querySelector('.gallery');

    for (const file of result.files) {
      try {
        const response = await storage.getFilePreview(BUCKET_ID, file.$id);

        const img = document.createElement('img');
        img.src = response;
        img.alt = file.name;
        gallery.appendChild(img);
      } catch (error) {
        console.error('error getting preview:', error);
      }
    }

  } catch (error) {
    console.error('error listing file:', error);
  }
}

addJobsToDom().then(() => {
  uploadedPhotos();
});

async function addJobsToDom(){
    document.querySelector('ul').innerHTML = ""
    let response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID
  );

  response.documents.forEach((job)=>{
    const formattedDate = format(new Date(job['date-added']), 'MMM d, yyyy');
    const li = document.createElement('li')
    li.textContent = `${formattedDate} || ${job['distance-steps']} steps || ${job['hold-time']} seconds`

    li.id = job.$id


    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'remove'
    deleteBtn.onclick = () => removeJob(job.$id)
    li.appendChild(deleteBtn)

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


}
