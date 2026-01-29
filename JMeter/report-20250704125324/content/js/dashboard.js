/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 88.83720930232558, "KoPercent": 11.162790697674419};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5954337899543379, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.010101010101010102, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.32857142857142857, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9791666666666666, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.898989898989899, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9583333333333334, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5789473684210527, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9868421052631579, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.7373737373737373, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.6363636363636364, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 860, 96, 11.162790697674419, 429.4511627906982, 89, 1894, 375.0, 805.8, 1036.299999999999, 1554.4599999999998, 2.0776459787886843, 58.89637278268668, 1.881425169261711], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.1 Vaccination questions", 96, 96, 100.0, 381.0208333333334, 136, 1612, 391.0, 517.8, 655.1999999999999, 1612.0, 0.3564691728429902, 8.69572069317473, 0.447936238433318], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.0 Register attendance", 99, 0, 0.0, 2546.262626262627, 1325, 6088, 2371.0, 3819.0, 4066.0, 6088.0, 0.37263714176020235, 68.23558165975972, 1.5915850758354224], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1489.6000000000001, 1145, 2339, 1441.0, 2085.2, 2228.5999999999995, 2339.0, 0.5890867472312923, 27.22167557835695, 2.8044901296411617], "isController": true}, {"data": ["2.5 Select patient", 96, 0, 0.0, 224.44791666666674, 141, 758, 187.0, 390.29999999999995, 510.39999999999867, 758.0, 0.3542814544729879, 9.738382837785224, 0.24564436784748184], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 270.42857142857156, 199, 1015, 236.0, 328.4, 487.7999999999972, 1015.0, 0.49187700264208223, 7.0668891238967895, 0.7109159803811343], "isController": false}, {"data": ["2.3 Search by first/last name", 99, 0, 0.0, 381.70707070707084, 252, 1061, 328.0, 588.0, 660.0, 1061.0, 0.3751520502627959, 13.739966044476361, 0.323487970266358], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 96, 96, 100.0, 381.6458333333333, 137, 1614, 391.0, 519.1999999999999, 655.3499999999999, 1614.0, 0.35717208997760236, 8.712867676809486, 0.44881951833855444], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 108.4857142857143, 89, 254, 100.0, 128.4, 222.79999999999984, 254.0, 0.5990483688768699, 3.6100854339249646, 0.36095004257522334], "isController": false}, {"data": ["2.5 Select flu", 96, 0, 0.0, 293.1041666666667, 137, 1521, 221.0, 475.3, 571.0999999999999, 1521.0, 0.35577033542471936, 8.46847688952034, 0.2466766974136238], "isController": false}, {"data": ["2.4 Patient attending session", 95, 0, 0.0, 627.5052631578949, 416, 1783, 540.0, 900.4000000000001, 1115.3999999999987, 1783.0, 0.3549040264795762, 12.412184602395415, 0.5275038362323389], "isController": false}, {"data": ["1.5 Open Sessions list", 38, 0, 0.0, 195.2368421052632, 112, 1138, 138.0, 319.2000000000001, 443.5499999999979, 1138.0, 0.13331368710575986, 1.4599411007851475, 0.08022049711095208], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 316.0, 316, 316, 316.0, 316.0, 316.0, 316.0, 3.1645569620253164, 19.84646954113924, 6.690689280063291], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 290.65714285714296, 253, 415, 274.0, 366.79999999999995, 387.79999999999984, 415.0, 0.6002812746544095, 3.0981313833481976, 0.32534776116523173], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 618.5714285714286, 405, 1269, 563.0, 982.5999999999996, 1251.3999999999999, 1269.0, 0.49250685991697746, 4.779336588862309, 0.7748325696545416], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 103.0, 103, 103, 103.0, 103.0, 103.0, 103.0, 9.70873786407767, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 99, 0, 0.0, 560.9191919191924, 252, 1894, 499.0, 1016.0, 1132.0, 1894.0, 0.3757301119220303, 25.738031548994826, 0.2441007822492191], "isController": false}, {"data": ["2.1 Open session", 99, 0, 0.0, 779.888888888889, 397, 1745, 744.0, 1286.0, 1393.0, 1745.0, 0.3765160475703305, 6.567203330788363, 0.24130215840676664], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 96, 100.0, 11.162790697674419], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 860, 96, "422/Unprocessable Entity", 96, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.1 Vaccination questions", 96, 96, "422/Unprocessable Entity", 96, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
