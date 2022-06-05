import Router from 'next/router'
import { ArticleStatusActions } from "./types";

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
