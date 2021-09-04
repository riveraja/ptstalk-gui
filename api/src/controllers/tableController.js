const debug = require('debug')('app:controllers:table');
const mongoose = require('mongoose');

exports.index = (req, res) => {
  const date = new Date().toISOString();

  let tableName =  req.query.tableName || req.body.tableName || '';
  
  if (tableName == '') {
    tableName = "processlists";
  }
  const tableSchema = mongoose.Schema({
    any: {}
  });
  let tableGeneric = mongoose.models[tableName] || mongoose.model(tableName, tableSchema);
  
  let sortOrder = req.query.sortOrder || req.body.sortOrder || {};
  const order = req.query.order || 'Id';
  const direction = req.query.direction || '1';
  if (Object.keys(sortOrder).length === 0) {
    sortOrder[order] = direction;    
  }
  else {
    debug(sortOrder);
    sortOrder = JSON.parse(sortOrder);
  }
  const queryParams = {}; 
  const pageSize = +req.query.pagesize || +req.body.pagesize || 50;
  let currentPage = +req.query.page || +req.body.page || 1;
  const pageCount = +req.query.pageCount || +req.body.pageCount || 1;
  const search = req.query.search || req.body.search || "";
  const action = req.query.action || req.body.action || '';
  let previousDisabled = "";
  let nextDisabled = "";

  if (search != '') {
    queryParams["$text"] = {
      $search: search
    };
  }
  switch(action) {
    case 'previous':
      currentPage--;
      if(currentPage <= 1) {
        currentPage = 1;
        previousDisabled = "disabled";
      } 
      break;
    case 'next':
      currentPage++;
      if (currentPage >= pageCount) {
        currentPage = pageCount;
        nextDisabled = "disabled";
      }
      break;
    case 'search':
      currentPage = 1;
      previousDisabled = "disabled";
      break;
    default:
      if (action.match(/^.*_SORT(ASC|DESC)$/)) {
        if (action.match(/^.*_SORTASC$/)) {
          columnSort = action.slice(0,-8);
          sortOrder = {};
          sortOrder[columnSort] = 1;
        }
        else {
          columnSort = action.slice(0,-9);
          sortOrder = {};
          sortOrder[columnSort] = -1;
        }
      }
      break;
  }

  const tableGenericQuery = tableGeneric.find(queryParams).sort(sortOrder);
  let tableGenerics;
  if (pageSize && currentPage) {
    tableGenericQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  tableGenericQuery
    .then((documents) => {
      tableGenerics = documents;
      return tableGeneric.countDocuments(queryParams);
    })
    .then((count) => {
      if (count > 0) {
        let c = tableGenerics[0];
        let columns = sanitizeColumns(Object.keys(c._doc));
        let rows = sanitizeRows(columns, tableGenerics);
        let pageCount = Math.ceil((count / pageSize));
        if (pageCount <= 1) {
          pageCount = 1;
          nextDisabled = "disabled";
        }
        res.render('index', { 
          tableName: tableName, 
          page: currentPage, 
          columns: columns, 
          captures: rows, 
          currentPage: currentPage, 
          pageCount: pageCount,
          previousDisabled: previousDisabled,
          nextDisabled: nextDisabled,
          sortOrder: JSON.stringify(sortOrder),
          search: search
        });  
      }
      else {
        res.render('index', { 
          tableName: tableName, 
          page: currentPage, 
          columns: [], 
          captures: [], 
          currentPage: 0, 
          pageCount:0,
          previousDisabled: "disabled",
          nextDisabled: "disabled",
          sortOrder: JSON.stringify(sortOrder),
          search: search
        });  
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: `ERROR: ${error.stack}`
      });
    });
}

function sanitizeColumns(columns) {
  cleanColumns = [];
  for (let i=0; i< columns.length; i++) {
    switch (columns[i]) {
      case "_id":
        break;

      default:
        cleanColumns.push(columns[i]);
    }
  } 
  return cleanColumns;
}

function sanitizeRows(columns, rows) {
  cleanRows = [];
  for (let row of rows) {
    cleanRow = [];
    stringJSON = JSON.stringify(row);
    objectJSON = JSON.parse(stringJSON);
    for (let column of columns) {
      cleanRow.push(objectJSON[column]);
    }
    cleanRows.push(cleanRow);
  }
  return cleanRows;
}
