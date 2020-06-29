const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')
const bdApiRoutes = require('./bdapi')

const schema = new mongoose.Schema({_id: Number})  
const dbData = mongoose.model('bdapi_data', schema, 'bdapi_data');

// params first letter upperCase
const paramsCase = (param) => {
    return param.toLowerCase().replace(/^\w/, firstChr => firstChr.toUpperCase());
}

// print json data or error on the endpoint
const printData = (res, apiData) => {
    try {
        res.json({ status: { code: 200, message: "ok", date: moment().format() }, data: apiData });
    } catch (err) {
        res.send(err);
    }
}

/**
 * all divisions. 
 * 
 * division: string, divisionbn: string
 */
const allDivisions = async (req, res) => {
    const data = await dbData.aggregate([
        { 
            $group: { 
                _id: { $toLower: "$division" }, 
                division: { $first: "$division" },
                divisionbn: { $first: "$divisionbn" } 
            }
        },
        { $sort : { division : 1 } }, 
    ]);

    printData(res, data);
}

/**
 * all districts. 
 * 
 * district: string, districtbn: string
 */
const allDistricts = async (req, res) => {
    const data = await dbData.aggregate([
        { 
            $group: { 
                _id: { $toLower: "$district" }, 
                district: { $first: "$district" },
                districtbn: { $first: "$districtbn" }
            } 
        },
        { $sort : { district : 1 } },
    ]);

    printData(res, data);
}

/**
 * all districts and upazilla by division name. 
 * 
 * district: string, upazilla: array
 */
const queryByDivision = async (req, res) => {
    const divisionName = paramsCase(req.params.divisionName);

    const data = await dbData.aggregate([
        {
            $match: { division: divisionName }
        },
        { 
            $group: { 
                _id: { $toLower: "$district" },
                district: { $first: "$district" },
                upazilla: { $push: "$upazilla" }
            } 
        },
        { $sort : { district : 1 } }
    ]);

    printData(res, data);
}

module.exports = {allDivisions, allDistricts, queryByDivision}
