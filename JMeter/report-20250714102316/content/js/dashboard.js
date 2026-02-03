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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6326025459688827, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7714285714285715, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.9615384615384616, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.45161290322580644, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9423076923076923, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.375, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.3068181818181818, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.038461538461538464, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.07857142857142857, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.44696969696969696, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8535714285714285, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.24285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.038461538461538464, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.9772727272727273, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.8804347826086957, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.9027777777777778, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9035714285714286, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.3357142857142857, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1180, 0, 0.0, 1106.7152542372876, 0, 20896, 414.5, 2295.4000000000005, 5860.650000000009, 12403.500000000007, 1.9548139779139153, 49.60264756153522, 2.254947294570587], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 54, 0, 0.0, 12398.462962962962, 3671, 36222, 10333.0, 26696.0, 30455.5, 36222.0, 0.10653598252809886, 30.171207577963624, 0.45126743293658544], "isController": true}, {"data": ["2.5 Select patient", 50, 0, 0.0, 427.7600000000001, 189, 2521, 353.0, 646.9, 1413.8499999999976, 2521.0, 0.10136066557467442, 2.7962636051353367, 0.07027936773244027], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 1699.9428571428568, 219, 11732, 234.0, 8637.4, 11620.8, 11732.0, 0.5538675781744524, 7.956978459496455, 0.8005117340802633], "isController": false}, {"data": ["2.5 Select menacwy", 26, 0, 0.0, 289.96153846153845, 193, 615, 220.0, 487.70000000000005, 589.8, 615.0, 0.30299498892902926, 7.666271686720662, 0.21126799032746765], "isController": false}, {"data": ["2.3 Search by first/last name", 62, 0, 0.0, 1323.5000000000005, 448, 9305, 815.0, 2216.2000000000007, 7404.599999999977, 9305.0, 0.11917187082538053, 8.72746433793779, 0.10283566883770906], "isController": false}, {"data": ["2.5 Select td_ipv", 26, 0, 0.0, 313.6923076923077, 192, 589, 273.0, 572.4, 587.6, 589.0, 0.3514700912470429, 9.006724716965191, 0.244724780331193], "isController": false}, {"data": ["4.0 Vaccination for flu", 44, 0, 0.0, 1499.75, 1343, 2120, 1455.5, 1698.5, 1956.25, 2120.0, 0.1356768424298489, 7.9770641815063215, 0.8174939292321924], "isController": true}, {"data": ["4.0 Vaccination for hpv", 44, 0, 0.0, 1850.2954545454543, 608, 5871, 1452.5, 3356.0, 4979.0, 5871.0, 0.13067042839112034, 6.360546091951889, 0.7428342397356893], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 91.11428571428571, 86, 113, 90.0, 96.0, 100.19999999999993, 113.0, 0.6004460456338995, 3.6185083472722592, 0.361792197418082], "isController": false}, {"data": ["2.4 Patient attending session", 54, 0, 0.0, 2248.0000000000005, 658, 10191, 1147.5, 7519.5, 9326.25, 10191.0, 0.10594737554616852, 6.700159853007826, 0.1574725640442075], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 290.0, 290, 290, 290.0, 290.0, 290.0, 290.0, 3.4482758620689653, 21.625808189655174, 7.290544181034483], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 270.48571428571427, 253, 348, 265.0, 299.59999999999997, 330.3999999999999, 348.0, 0.5997052876871937, 3.0951586381121277, 0.32503558072889893], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 3192.028571428572, 411, 12525, 644.0, 8722.599999999999, 10434.59999999999, 12525.0, 0.5487699713071701, 5.325319536014989, 0.8633480700936045], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 26, 0, 0.0, 2644.0384615384614, 1392, 7775, 1786.0, 5738.200000000001, 7327.699999999998, 7775.0, 0.33110896031786463, 18.883694694456473, 2.024112452880648], "isController": true}, {"data": ["2.1 Open session", 70, 0, 0.0, 4827.8714285714295, 1141, 18958, 3183.5, 12248.499999999998, 14802.450000000004, 18958.0, 0.13138655990570197, 2.3352751269757253, 0.083207211034031], "isController": false}, {"data": ["4.3 Vaccination confirm", 132, 0, 0.0, 1075.0454545454545, 570, 7150, 867.5, 1605.2000000000003, 2988.0499999999984, 6661.599999999981, 0.33429654636211914, 7.08642742963311, 0.7781456481934058], "isController": false}, {"data": ["4.1 Vaccination questions", 140, 0, 0.0, 487.8142857142857, 262, 5221, 318.5, 573.7, 942.849999999997, 4537.530000000006, 0.3279118572927597, 4.297374553220094, 0.7044546716021305], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 5714.057142857143, 1140, 19597, 1618.0, 14882.599999999999, 17496.99999999999, 19597.0, 0.5283018867924528, 24.41177771226415, 2.515109080188679], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 26, 0, 0.0, 1902.8076923076924, 1419, 3104, 1731.0, 2814.4, 3011.95, 3104.0, 0.29874069307840795, 16.019969666329626, 1.826644940941263], "isController": true}, {"data": ["Calculate site depending on vaccination", 142, 0, 0.0, 0.4366197183098594, 0, 15, 0.0, 1.0, 1.0, 8.979999999999905, 0.30176361708322086, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 44, 0, 0.0, 343.40909090909093, 192, 2290, 235.5, 460.0, 488.75, 2290.0, 0.13091614523361095, 3.1468166456159454, 0.09754786993480971], "isController": false}, {"data": ["2.5 Select flu", 46, 0, 0.0, 676.9130434782609, 187, 9673, 369.5, 848.8000000000019, 3370.949999999996, 9673.0, 0.09734440237943578, 2.346046802157025, 0.06749465399355412], "isController": false}, {"data": ["1.5 Open Sessions list", 36, 0, 0.0, 502.41666666666663, 141, 5313, 148.5, 1158.7000000000048, 3983.5999999999976, 5313.0, 0.5808044141135472, 6.359921772905475, 0.34795642051046255], "isController": false}, {"data": ["4.2 Vaccination batch", 140, 0, 0.0, 395.41428571428565, 259, 4651, 288.0, 544.7, 707.1499999999999, 3456.26000000001, 0.3282162851543085, 6.9697012044951565, 0.5278224292752516], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 84.0, 84, 84, 84.0, 84.0, 84.0, 84.0, 11.904761904761903, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 70, 0, 0.0, 3046.2428571428577, 500, 20896, 1037.0, 7936.499999999999, 14929.200000000012, 20896.0, 0.13172701645834978, 12.48082056110534, 0.0845805794153955], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1180, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
