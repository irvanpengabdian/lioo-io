const fs = require('fs');
const mammoth = require('mammoth');

mammoth.extractRawText({path: "System Design/lioo PRD V2.docx"})
  .then(function(result){
      fs.writeFileSync("temp_prd_utf8.txt", result.value, 'utf8');
      console.log("Extraction complete.");
  })
  .catch(function(err){
      console.error(err);
  });
