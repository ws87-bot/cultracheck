const { Pinecone } = require("@pinecone-database/pinecone");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function exportAll() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;

  if (!apiKey || !indexName) {
    console.error("请在 .env.local 中配置 PINECONE_API_KEY 和 PINECONE_INDEX");
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey });
  const index = pc.index({ name: indexName });
  const ns = index.namespace("");

  let allRecords = [];
  let paginationToken = undefined;

  do {
    const listResult = await ns.listPaginated({
      limit: 100,
      paginationToken,
    });

    if (listResult.vectors && listResult.vectors.length > 0) {
      const ids = listResult.vectors.map((v) => v.id);
      const fetchResult = await ns.fetch({ ids });

      for (const [id, vector] of Object.entries(fetchResult.records || {})) {
        allRecords.push({
          id,
          metadata: vector.metadata || {},
        });
      }
    }

    paginationToken = listResult.pagination?.next;
    console.log(`已导出 ${allRecords.length} 条...`);
  } while (paginationToken);

  const outPath = path.resolve(process.cwd(), "knowledge-export.json");
  fs.writeFileSync(outPath, JSON.stringify(allRecords, null, 2), "utf-8");
  console.log(`\n导出完成！共 ${allRecords.length} 条，保存到 ${outPath}`);
}

exportAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
