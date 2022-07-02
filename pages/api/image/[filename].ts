import { NextApiRequest, NextApiResponse } from "next/types";
import {lookup} from 'mime-types';
import { readMediaFile } from "../../../lib/fsutils";

const GetImage = (req: NextApiRequest, res: NextApiResponse) => {
    const {filename, compressed} = req.query as {filename: string, compressed: string};
    const useCompressed = compressed === 'true';
    const mimetype = lookup(filename);
    const file = readMediaFile(filename, useCompressed);
    res.setHeader('Content-Type', mimetype as string);
    res.send(file);
    res.end();
}

export default GetImage;