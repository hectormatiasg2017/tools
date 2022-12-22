import CsvReadableStream from 'csv-reader';
import * as _ from 'lodash';
import csv from 'csv';
import fs from 'fs-extra';

const columns = [
    {
        key:'drug',
        header: 'Product Name'
    }, 	
    {
        key:'NDC10',
        header: 'NDC'
    }, 	
    {
        key:'GPI',
        header: 'GPI'
    }, 	
    {
        key:'brand_type',
        header: 'Type'
    }, 	
    {
        key:'rx_otc_indicator_code',
        header: 'Rx OTC Indicator Code'
    }, 	
    {
        key:'DEA_abbreviation',
        header: 'DEA Abbreviation'
    }, 	
    {
        key:'DEA_description',
        header: 'DEA Description'
    }, 	
    {
        key:'strength',
        header: 'Strength'
    }, 	
    {
        key:'strength_unit_of_measure',
        header: 'Strength Unit'
    }, 	
    {
        key:'dosage_form_description',
        header: 'dosage_form_description'
    }, 	
    {
        key:'route_of_administration',
        header: 'Route'
    }, 	
    {
        key:'storage_condition',
        header: 'Storage Condition'
    }, 	
    {
        key:'limited_distribution',
        header: 'Limited Distribution'
    }, 	
    {
        key:'package_size',
        header: 'Package Size'
    }, 	
    {
        key:'package_size_unit_of_measure',
        header: 'Package Size Unit'
    }, 	
    {
        key:'package_quantity',
        header: 'Package Quantity'
    }, 	
    {
        key:'manufacturers_abbreviated_name',
        header: 'Manufacturer'
    }, 	
    {
        key:'manufacturers_labeler_name',
        header: 'Labeler'
    }, 	
    {
        key:'awp_package_price',
        header: 'AWP'
    }, 	
    {
        key:'custom_description',
        header: 'Description'
    }
]

console.log(`processor.ts line:5 __dirname: ${__dirname}/input/med.csv`);
const inputCsvFile = __dirname + `/input/med.txt`;

const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

const inputStream = fs.createReadStream(inputCsvFile, { encoding: 'utf8' });

const outputCsvFile = __dirname + `/output/med_out.txt`;
let writableStream = fs.createWriteStream(outputCsvFile, { encoding: 'utf8' });

const readerConfig = {
    delimiter: ',',
    skipHeader: true,
    allowQuotes: true,
    parseNumbers: false,
    parseBooleans: false,
    trim: true,
    asObject: true,
};

//   const brandType = new Map();
//   const limited_distribution = new Map();
//   const ndc = new Map();

function getValue(value: any, separator: string = '/', defaultValue: string = '') {
    if (_.isString(value) && (value.toUpperCase() == 'NULL' || _.isEmpty(value) || value.toUpperCase().trim() == 'DOESNOTAPPLY')) {
        return defaultValue;
    }
    return ` ${separator} ${value}`;
}

let counter = 0;

let arr: any[] = [];

inputStream.pipe(
    new CsvReadableStream(readerConfig)
)
    .pipe(csv.transform((data) => {
        // let temp = ndc.get(data.NDC10);
        // if (temp){
        //     ndc.set(data.NDC10, temp + 1);
        // }
        // else 
        // ndc.set(data.NDC10, 1);

        // temp = limited_distribution.get(data.limited_distribution);
        // if (temp){
        //     limited_distribution.set(data.limited_distribution, temp + 1);
        // }
        // else 
        // limited_distribution.set(data.limited_distribution, 1);

        data.awp_package_price = (_.isNaN(Number(data.awp_package_price))) ? null : Number(data.awp_package_price).toFixed(2);
        data.NDC10 = (_.isString(data.NDC10)) ? data.NDC10.replace(/\s+/gm, '') : data.NDC10;
        data.awp_package_price = (_.isString(data.awp_package_price)) ? data.awp_package_price.replace(/\s+/gm, '') : data.awp_package_price;
        data.custom_description =
            `${data.drug}
            ${getValue(data.package_quantity)}${getValue(data.package_size, 'package -')} ${data.package_size_unit_of_measure}
            ${getValue(data.dosage_form_description)}
            ${getValue(data.storage_condition)}
            ${getValue(data.awp_package_price, '/ AWP:')}
            ${getValue(data.NDC10, '/ NDC:')}`
                .replace(/(\r\n|\n|\r|\t)/gm, '')
                .replace(/\s+/gm, ' ');
        return data;
    }))
    .pipe(csv.stringify({ header: true, columns }))
    .pipe(writableStream)
    .on('error', (err: any) => {
        console.log('Error: ', err);
    })
    .on('finish', () => {
        console.log('Finished');
        // ndc.forEach((a,b)=>{
        //     console.log(`processor.ts line:78 a: ${a}: ${b}`);
        // })
    })

