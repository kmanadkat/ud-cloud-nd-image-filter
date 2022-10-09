import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url.
  // GET /filteredimage?image_url={{URL}}
  app.get('/filteredimage', async(req: Request, res: Response) => {
    try {
      // 1. validate the image_url query
      const {image_url} = req.query
      if(typeof image_url !== "string" || !image_url.startsWith('http')) {
        // Bad Request Response
        return res.status(400).json({
          success: false,
          message: 'image_url missing or invalid'
        })
      }

      // 2. call filterImageFromURL(image_url) to filter the image
      const newImagePath: string = await filterImageFromURL(image_url)

      // 3. send the resulting file in the response
      return res.status(201).sendFile(newImagePath, (err) => {
        if(err){
          return res.status(500).json({success: false, message: err.message})
        }
        // 4. deletes any files on the server on finish of the response
        deleteLocalFiles([newImagePath])
      })
    } catch (error) {
      // Server Error
      console.error(error)
      return res.status(500).json({success: false, message: 'Internal Server Error'})
    }
  })

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();