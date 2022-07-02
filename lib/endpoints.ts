import Router from 'next/router'
import { ArticleStatusActions, ArticleContent, ImageData, Slideshow, ArticleAdminFull } from "./types";

type ImageWithBlob = ImageData & {blob: Blob};

export async function takeArticleAction(title: string, action: ArticleStatusActions) {
    await fetch('/api/article-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({title, action}),
    });
};

export function editArticleRedirect(title: string) {
    Router.push(`/edit-article?title=${encodeURIComponent(title)}`);
}

export function adminRedirect() {
    Router.push('/admin');
}

export function goToArticle(title: string) {
    Router.push(`/article?title=${title}`);
}

export function goHome() {
    Router.push('/');
}

export function uniqueImageId(image: ImageData) { 
    return `${image.size.toString()}-${image.name}`;
}

export function compressedUrl(url: string) {
    return `${url}?compressed=true`
}

export async function uploadArticle(
    summary: ArticleAdminFull,
    article: ArticleContent,
    shouldIgnoreUpload: (image: ImageData) => boolean,
    onProgress: (pct: number) => void,
): Promise<boolean> {
    // make it human readable
    const articleContentJson = JSON.stringify(article, null, 4);

    const imagesToUpload = (
        article.filter(({type}) => type === 'slideshow') as Slideshow[]
    ).flatMap(
        ({images}) => images
    ).filter(
        image => !shouldIgnoreUpload(image)
    );

    // grab the files
    const files: ImageWithBlob[] = await Promise.all(imagesToUpload.map(async (image) => {
        const localResult = await fetch(image.url);
        const blob = await localResult.blob();
        return {...image, blob};
    }));

    const formData = new FormData();

    formData.append('Summary', JSON.stringify(summary));
    formData.append('ArticleContent', articleContentJson);
    for (const file of files) {
        formData.append('Files', file.blob, uniqueImageId(file));
    }

    return await new Promise((resolve, reject) => {
        // create request
        const req = new XMLHttpRequest();

        // define onload & onerror
        req.onload = () => {
            resolve(req.response);
        };

        req.onerror = () => {
            const err = new Error(req.response.statusText);
            err.name = req.response.status;
            console.error(err.name)
            reject(err);
        };

        req.upload.addEventListener('progress', (event: ProgressEvent) => {
            const uploadProgress = event.loaded / event.total;
            onProgress(uploadProgress);
        });

        req.open("POST", '/api/upload-article');
        req.send(formData);
    });
}
