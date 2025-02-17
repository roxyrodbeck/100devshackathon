export default function Storage() {
return (
<>
const storage = client.storage;

function handleFileUpload(event) {
  const file = event.target.files[0];

  storage.createFile('handstand_photos', file.name, file)

  .then((response) => {
    console.log('File uploaded successfully', response.id)
  })

  .catch((error) => {
    console.error('Error uploading file' error)
  });
}
</>
)}