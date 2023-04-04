export type CreateArticleParams = {
  title: string;
  description: string;
  body: string;
  tags?:string[]
  slug:string
};

export type UpdateArticleParams = {
  title?: string;
  description?: string;
  body?: string;
  slug?:string
};
