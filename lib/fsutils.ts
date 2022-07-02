import { readFileSync, writeFileSync, renameSync, existsSync } from "fs";
import {join} from 'path';
import { AdminFile, ArticleAdminFull, ArticleAdminSummary, ArticleContent, CombinedArticle } from "./types";
import { createHash } from "crypto";
import { resizeImage } from "./images";

const {DATA_DIRECTORY} = process.env;
export const AdminFilePath = join(DATA_DIRECTORY!, 'admin.json');
export const ContentDirectory = join(DATA_DIRECTORY!, 'content');
export const MediaDirectory = join(DATA_DIRECTORY!, 'media');
export const CompressedMediaDirectory = join(DATA_DIRECTORY!, 'compressed-media');

export function filenameFromTitle(title: string) {
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

export function writeContentFile(filename: string, content: ArticleContent) {
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

    ReadOnlyDb.build();
    return;
}

export function deleteArticleMetadata(title: string) {
    const adminFile = getAdminFileCopy();
    if (!adminFile.articles.find(article => article.title === title)) {
        throw new Error('Article does not exist');
    }
    adminFile.articles = adminFile.articles.filter(article => article.title !== title);
    writeAdminFile(adminFile);

    ReadOnlyDb.build();
}

export function updateArticleMetadata(title: string, updateProps: Partial<ArticleAdminSummary>) {
    const adminFile = getAdminFileCopy();
    const article = adminFile.articles.find(article => article.title === title);
    if (!article) {
        throw new Error('Article does not exist');
    }
    Object.assign(article, updateProps);
    writeAdminFile(adminFile);

    ReadOnlyDb.build();
}

async function tryCompressFile(filename: string) {
    const currentPath = join(MediaDirectory, filename);
    const compressedPath = join(CompressedMediaDirectory, filename);
    try {
        console.log(`Attempting to compress ${filename}`);
        await resizeImage(currentPath, compressedPath);
    } catch (error) {
        console.error(error);
    }
}

export function getCompressedPath(filename: string) {
    const compressedPath = join(CompressedMediaDirectory, filename);
    if (existsSync(compressedPath)) return compressedPath;
    else return undefined;
}

export function saveMediaFile(currentPath: string, filename: string) {
    const newPath = join(MediaDirectory, filename);
    renameSync(currentPath, newPath);
    tryCompressFile(filename);
}

export function readMediaFile(filename: string, compressed = false) {
    let path = join(MediaDirectory, filename);
    if (compressed) {
        path = getCompressedPath(filename) || path;
    }
    return readFileSync(path);
}

class ReadOnlyArticleDb {
    public articles!: Map<string, ArticleAdminFull>;
    public content!: Map<string, ArticleContent>
    
    constructor() {
        this.build();
    }

    public build() {
        this.articles = new Map();
        this.content = new Map();
        const adminFile = getAdminFileCopy();
        for (const item of adminFile.articles) {
            this.articles.set(item.title, item);
            const content = getArticleContent(item.filename);
            this.content.set(item.title, content);
        }
    }

    hasArticle(title: string) {
        return this.articles.has(title) && this.content.has(title);
    }
    
    getPublishedArticleSummaries() {
        const allArticles = [...this.articles.values()];
        return allArticles.filter((item) => item.published);
    }

    getArticle(title: string): CombinedArticle {
        if (!this.hasArticle(title)) throw new Error(`No such article ${title}`);
        const summary = this.articles.get(title)!;
        const content = this.content.get(title)!;
        return {...summary, content};
    }
}

export const ReadOnlyDb = new ReadOnlyArticleDb();
