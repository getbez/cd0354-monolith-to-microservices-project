import {Router, Request, Response} from 'express';
import {FeedItem} from '../models/FeedItem';
import {NextFunction} from 'connect';
import * as jwt from 'jsonwebtoken';
import * as AWS from '../../../../aws';
import * as c from '../../../../config/config';

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({message: 'No authorization headers.'});
  }

  const tokenBearer = req.headers.authorization.split(' ');
  if (tokenBearer.length != 2) {
    return res.status(401).send({message: 'Malformed token.'});
  }

  const token = tokenBearer[1];
  return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
    }
    return next();
  });
}

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
  items.rows.map((item) => {
    if (item.url) {
      AWS.getGetSignedUrl(item.url).then( (val)=> item.url = val).then( (signedurl)=> {   
        item.url = signedurl;   
        res.status(201).send( item.url);
      }).catch(error => {
        console.error("GET all feeds: error getting url from aws", error);
        res.status(400).send("url not found");
      })
    }
  });
  res.send(items);
});

// Get a feed resource
router.get('/:id',
    async (req: Request, res: Response) => {
      const {id} = req.params;
      const item = await FeedItem.findByPk(id);
      res.send(item);
    });

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
     (req: Request, res: Response) => {
      const {fileName} = req.params; 
        AWS.getPutSignedUrl(fileName)
        .then( (signedurl)=> {   
          const url = signedurl;   
          res.status(201).send({url: url});
        }).catch(error => {
          console.error("GET GetPutSignedUrl: error getting url from aws", error);
          res.status(400).send("url not found");
        })
    }
    );

// Create feed with metadata
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
      const caption = req.body.caption;
      const fileName = req.body.url; // same as S3 key name

      if (!caption) {
        return res.status(400).send({message: 'Caption is required or malformed.'});
      }

      if (!fileName) {
        return res.status(400).send({message: 'File url is required.'});
      }

      const item = await new FeedItem({
        caption: caption,
        url: fileName,
      });

      const savedItem = await item.save();

        AWS.getGetSignedUrl(savedItem.url).then( (signedurl)=> {
          savedItem.url = signedurl;
          res.status(201).send(savedItem);
        }).catch(error => {
          console.error("GET GetSignedUrl: error getting url from aws", error);
          res.status(400).send("url not found");
        })
      
      }
)

export const FeedRouter: Router = router;
