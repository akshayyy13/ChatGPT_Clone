// types.ts

export type TextContent = { type: "text"; text: string };

export type ImageContent = {
  type: "image";
  url: string;
  mime?: string;
  name?: string;
};

export type FileContent = {
  type: "file";
  url: string;
  mime?: string;
  name?: string;
};

export type Content = TextContent | ImageContent | FileContent;

export type Msg = {
  _id?: string;
  role: "user" | "assistant";
  content: Content[];
};
