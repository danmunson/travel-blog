/**
 * At the application level, deletion is done by dereferencing.
 * This script is essentially a garbage collector, deleting
 * all unnecessary JSON and media files.
 */

import dotenv from 'dotenv';
dotenv.config({path: './.env.local'});

import {
    ReadOnlyDb,
    ContentDirectory,
    MediaDirectory,
    CompressedMediaDirectory,
    getAdminFileCopy,
    getCompressedPath,
} from "../lib/fsutils";

import {join} from 'path';
import {readdirSync, unlinkSync} from 'fs';
import { Slideshow } from '../lib/types';

function getLiveArticleFilePaths() {
    const adminFile = getAdminFileCopy();
    return new Set(adminFile.articles.map(({filename}) => join(ContentDirectory, filename)));
}

function getLiveMediaFilePaths() {
    const allContent = [...ReadOnlyDb.content.values()];
    const allSlideshows = allContent.flat().filter(({type}) => type === 'slideshow') as Array<Slideshow & {id: string}>;
    const allImageNames = allSlideshows.flatMap(({images}) => images).map(({url}) => url.split('/api/image/')[1]);
    const regularMediaPaths = allImageNames.map((name) => join(MediaDirectory, name));
    const compressedMediaPaths = allImageNames.map(getCompressedPath).filter(Boolean) as Array<string>;
    return new Set([...regularMediaPaths, ...compressedMediaPaths]);
}

function setSubtract(set1: Set<string>, set2: Set<string>) {
    const remainder: Set<string> = new Set();
    for (const item of set1) {
        if (!set2.has(item)) remainder.add(item);
    }
    return remainder;
}

function collectGarbage() {
    const allArticleFiles: Set<string> = new Set();
    const allMediaFiles: Set<string> = new Set();
    const register = (set: Set<string>, dir: string, name: string) => set.add(join(dir, name));
    const registerAll = (set: Set<string>, dir: string) => readdirSync(dir).forEach((name) => register(set, dir, name));

    // register existing files
    registerAll(allArticleFiles, ContentDirectory);
    registerAll(allMediaFiles, MediaDirectory);
    registerAll(allMediaFiles, CompressedMediaDirectory);

    // get live content files
    const liveArticleFilepaths = getLiveArticleFilePaths();
    const liveMediaFilePaths = getLiveMediaFilePaths();

    const articleFilesToDelete = setSubtract(allArticleFiles, liveArticleFilepaths);
    const mediaFilesToDelete = setSubtract(allMediaFiles, liveMediaFilePaths);

    console.log('Articles to delete');
    console.log(articleFilesToDelete);

    console.log('Media to delete');
    console.log(mediaFilesToDelete);

    console.log(`Deleting ${articleFilesToDelete.size} article files and ${mediaFilesToDelete.size} media files`);
    console.log('-------->')

    let counter = 1;
    for (const filepath of [...articleFilesToDelete, ...mediaFilesToDelete]) {
        console.log(`(${counter++}) ${filepath}`);
        unlinkSync(filepath);
    }
}

collectGarbage();
