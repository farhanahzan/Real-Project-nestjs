export type ArticleParams = {
  title: string;
  description: string;
  body: string;
  tagList?:string[]
  slug:string
};

export type CreateArticleParams={
  article:ArticleParams
}


export type UpdateParams = {
  title?: string;
  description?: string;
  body?: string;
  slug?:string
};


export type UpdateArticleParams={
  article:UpdateParams
}