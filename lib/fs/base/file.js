export class BaseFile {
    constructor(content) {
        this.content = content;
        this.readOnly = false;
    }
    async put() {
        const { cid } = await this.putDetailed();
        return cid;
    }
    async updateContent(content) {
        if (this.readOnly)
            throw new Error("File is read-only");
        this.content = content;
        return this;
    }
}
export default BaseFile;
//# sourceMappingURL=file.js.map