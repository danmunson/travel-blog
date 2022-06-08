import { readFileSync, writeFileSync } from "fs";
import {join} from 'path';
import { AdminFile, ArticleAdminSummary, ArticleContent } from "./types";
import { createHash } from "crypto";

const {DATA_DIRECTORY} = process.env;
const AdminFilePath = join(DATA_DIRECTORY!, 'admin.json');
const ContentDirectory = join(DATA_DIRECTORY!, 'content');

function filenameFromTitle(title: string) {
    const hash = createHash('md5').update(title).digest('hex').toString();
    const escapedName = title.replace(/(\W+)/gi, '');
    return `${escapedName}-${hash}.json`;
}

function filepathToJSONObject(filepath: string) {
    return JSON.parse(readFileSync(filepath).toString());
}

export function getAdminFileCopy(): AdminFile {
    return filepathToJSONObject(AdminFilePath);
}

function writeAdminFile(newAdminFile: AdminFile) {
    writeFileSync(AdminFilePath, JSON.stringify(newAdminFile, null, 4));
}

function writeContentFile(filename: string, content: ArticleContent) {
    const path = join(ContentDirectory, filename);
    writeFileSync(path, JSON.stringify(content, null, 4));
}

export function getArticleContent(filename: string): ArticleContent {
    const fullPath = join(ContentDirectory, filename);
    return filepathToJSONObject(fullPath);
}

export function newArticle(title: string) {
    const adminFile = getAdminFileCopy();

    // ensure that title is unique
    if (adminFile.articles.find(article => article.title === title)) {
        throw new Error('Title is not unique');
    }

    const article = {
        title,
        createdTime: Date.now(),
        published: false,
        filename: filenameFromTitle(title)
    };
    writeContentFile(article.filename, []);

    adminFile.articles.push(article);
    writeAdminFile(adminFile);

    return;
}

export function deleteArticleMetadata(title: string) {
    const adminFile = getAdminFileCopy();
    if (!adminFile.articles.find(article => article.title === title)) {
        throw new Error('Article does not exist');
    }
    adminFile.articles = adminFile.articles.filter(article => article.title !== title);
    writeAdminFile(adminFile);
}

export function updateArticleMetadata(title: string, updateProps: Partial<ArticleAdminSummary>) {
    const adminFile = getAdminFileCopy();
    const article = adminFile.articles.find(article => article.title === title);
    if (!article) {
        throw new Error('Article does not exist');
    }
    Object.assign(article, updateProps);
    writeAdminFile(adminFile);
}