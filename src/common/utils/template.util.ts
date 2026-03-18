import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a template reader for a specific directory.
 * @param dirname The current directory (__dirname)
 * @param relativePathFromRoot The path from project root to the template folder
 * @returns A function that takes a template name and returns its content
 */
export const createTemplateReader = (
  dirname: string,
  relativePathFromRoot: string,
) => {
  return (templateName: string): string => {
    const localPath = path.join(dirname, 'templates', templateName);

    try {
      return fs.readFileSync(localPath, 'utf-8');
    } catch (error) {
      const fallbackPath = path.join(
        process.cwd(),
        relativePathFromRoot,
        templateName,
      );
      return fs.readFileSync(fallbackPath, 'utf-8');
    }
  };
};
