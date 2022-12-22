import fs from 'fs-extra';
const csvSplitStream = require('csv-split-stream');

const outputCsvFile = __dirname + `/output/med_out.txt`;
const outputFolder = __dirname + `/output`;

  csvSplitStream.split(
    fs.createReadStream(outputCsvFile),
    {
        lineLimit: 29500
    },
    (index:number) => fs.createWriteStream(`${outputFolder}/output-${index}.csv`)
  )
  .then(
    ()=>{
        console.log(`split done`);
    }
  )
