import { Parser } from "json2csv";

export const generateCSV = (data) => {
  const parser = new Parser();
  return parser.parse(data);
};
