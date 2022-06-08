
export type ArticleAdminSummary = {
    title: string;
    createdTime: number;
    published: boolean;
};

export type ArticleAdminFull = ArticleAdminSummary & {
    filename: string;
};

export type AdminFile = {
    articles: ArticleAdminFull[];
}

export type ImageData = {url: string, name: string, size: number}; // assume unique by name+size

export type ContentTypeDeclaration = {type: 'paragraph'|'slideshow'|'video'};
export type Paragraph = {paragraph: string, type: 'paragraph'};
export type Slideshow = {images: ImageData[], type: 'slideshow'};
export type Video = {videoUrls: string, type: 'video'};
export type ArticleItem = (Paragraph|Slideshow|Video) & {id: string};

export type ArticleContent = Array<ArticleItem>;

export type ArticleStatusActions = 'new'|'publish'|'unpublish'|'delete';

export type EditState = {
    articleState: Record<string, ArticleItem>;
    articleOrder: string[];
};

