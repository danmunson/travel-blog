import { NextApiRequest, NextApiResponse } from "next/types";
import {lookup} from 'mime-types';
import { readMediaFile } from "../../../lib/fsutils";

const GetImage = (req: NextApiRequest, res: NextApiResponse) => {
    const {filename} = req.query as {filename: string};
    const mimetype = lookup(filename);
    const file = readMediaFile(filename);
    res.setHeader('Content-Type', mimetype as string);
    res.send(file);
    res.end();
}

export default GetImage;