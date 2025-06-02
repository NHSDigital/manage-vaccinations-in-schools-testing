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

    var data = {"OkPercent": 99.96086105675147, "KoPercent": 0.03913894324853229};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8172043010752689, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9916666666666667, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9166666666666666, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.865, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.97, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.965, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9916666666666667, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.44086021505376344, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.525, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9864864864864865, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9662162162162162, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9916666666666667, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.345, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9139784946236559, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5703125, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.930379746835443, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5645161290322581, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.45, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.946236559139785, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.967741935483871, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.36, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9595959595959596, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9917355371900827, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9527027027027027, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9453125, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [1.0, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.984375, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.66, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9807692307692307, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9743589743589743, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2555, 1, 0.03913894324853229, 371.4258317025435, 0, 4133, 251.0, 752.0, 1136.1999999999998, 2422.8000000000106, 4.2569923807334025, 121.13411977050147, 3.9348445083548684], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 60, 0, 0.0, 101.26666666666668, 87, 445, 94.0, 104.0, 110.69999999999997, 445.0, 0.11902282262623859, 0.08636128633915553, 0.09507877823072573], "isController": false}, {"data": ["1.4 Select Organisations-1", 60, 0, 0.0, 121.94999999999999, 96, 817, 109.5, 127.5, 153.59999999999997, 817.0, 0.11902093379857294, 1.623519925096159, 0.0769451739986868], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 3434.0700000000015, 2451, 9037, 3206.5, 4587.3, 5236.649999999997, 9003.519999999982, 0.19826282116098742, 60.11596314963292, 0.8526366198122055], "isController": true}, {"data": ["1.3 Sign-in-1", 60, 0, 0.0, 106.9166666666667, 91, 344, 102.5, 115.5, 123.79999999999998, 344.0, 0.1190440760691646, 1.0706991607392637, 0.07858769084253445], "isController": false}, {"data": ["1.3 Sign-in-0", 60, 0, 0.0, 416.55000000000007, 317, 1225, 371.5, 566.2, 768.65, 1225.0, 0.11898954081936197, 0.08447792595280876, 0.10864767643174165], "isController": false}, {"data": ["1.4 Select Organisations", 60, 0, 0.0, 223.5333333333333, 189, 917, 202.0, 235.59999999999997, 261.19999999999993, 917.0, 0.11899898057539975, 1.7095644562936576, 0.17199071411288241], "isController": false}, {"data": ["2.4 Patient attending session-1", 100, 0, 0.0, 503.88000000000005, 249, 3807, 412.5, 873.3000000000001, 1056.0499999999995, 3787.8899999999903, 0.19871234401080995, 23.231978265216398, 0.13273363603847071], "isController": false}, {"data": ["2.4 Patient attending session-0", 100, 0, 0.0, 246.03000000000006, 144, 1652, 216.0, 389.5000000000002, 541.0999999999987, 1642.189999999995, 0.19880755230129682, 0.14774662822391296, 0.16269602424656907], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 300.2399999999999, 182, 2780, 240.0, 451.9, 504.0, 2758.649999999989, 0.1970257000323122, 5.823748751349626, 0.16998276825541622], "isController": false}, {"data": ["1.2 Sign-in page", 60, 0, 0.0, 101.00000000000001, 84, 577, 89.0, 97.9, 112.74999999999997, 577.0, 0.11896618386223716, 0.716933906849478, 0.071681772893555], "isController": false}, {"data": ["3.0 Nurse triage", 93, 0, 0.0, 1246.2258064516127, 719, 3626, 1081.0, 1811.2, 3070.7999999999997, 3626.0, 0.20441986521477276, 23.256898208798404, 0.6085693927136407], "isController": true}, {"data": ["4.2 Vaccination batch-2", 74, 0, 0.0, 0.5, 0, 4, 0.0, 1.0, 1.0, 4.0, 0.1817636973683564, 0.8561766727786756, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 100, 0, 0.0, 750.19, 411, 4133, 613.0, 1225.2000000000003, 1320.1999999999998, 4118.769999999993, 0.1986491855383393, 23.37222317925606, 0.295257871473977], "isController": false}, {"data": ["4.2 Vaccination batch-0", 74, 0, 0.0, 173.59459459459464, 96, 2122, 113.0, 272.5, 285.0, 2122.0, 0.18170924556285667, 0.13592703330190253, 0.16325440031037902], "isController": false}, {"data": ["4.2 Vaccination batch-1", 74, 0, 0.0, 212.78378378378386, 111, 2745, 137.0, 338.0, 765.0, 2745.0, 0.1816922918272843, 2.471761829794835, 0.12484631348795185], "isController": false}, {"data": ["1.1 Homepage", 60, 0, 0.0, 269.4833333333333, 247, 557, 259.0, 293.9, 316.4, 557.0, 0.11870492922218595, 0.6126519052141141, 0.06433714425616524], "isController": false}, {"data": ["1.3 Sign-in", 60, 0, 0.0, 523.6833333333334, 412, 1323, 470.5, 668.0, 887.8999999999999, 1323.0, 0.11896500446118767, 1.1544484856746307, 0.18716076385446614], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1453.5600000000006, 873, 3873, 1290.5, 2123.000000000001, 2919.95, 3872.22, 0.1971643818600882, 3.3772102127206516, 0.12384387735586791], "isController": false}, {"data": ["3.3 Nurse triage complete", 93, 0, 0.0, 373.97849462365576, 142, 2705, 215.0, 689.0000000000001, 1531.899999999998, 2705.0, 0.20661340632192593, 4.795651808367176, 0.139625465990989], "isController": false}, {"data": ["4.3 Vaccination confirm", 64, 0, 0.0, 758.5000000000001, 431, 3136, 699.0, 1086.5, 1178.25, 3136.0, 0.17413876138364132, 4.22474888051224, 0.40511920342400337], "isController": false}, {"data": ["4.1 Vaccination questions", 79, 1, 1.2658227848101267, 398.1645569620253, 219, 2671, 280.0, 497.0, 1239.0, 2671.0, 0.17291949393687345, 1.9961689063662829, 0.34628787402048766], "isController": false}, {"data": ["3.1 Nurse triage new", 96, 0, 0.0, 145.96875, 106, 370, 134.0, 192.89999999999998, 291.6499999999999, 370.0, 0.2028491858563405, 2.284416035360205, 0.1394588152762341], "isController": false}, {"data": ["3.2 Nurse triage result", 93, 0, 0.0, 725.7956989247314, 343, 2875, 713.0, 838.0, 1099.8999999999999, 2875.0, 0.20617596786315237, 16.349300470435917, 0.33272157750664527], "isController": false}, {"data": ["1.0 Login", 60, 0, 0.0, 1242.6833333333338, 1065, 1979, 1173.0, 1534.1, 1952.7499999999986, 1979.0, 0.11849043189762427, 5.471851116772321, 0.5641023979501155], "isController": true}, {"data": ["3.2 Nurse triage result-1", 93, 0, 0.0, 385.18279569892474, 178, 2337, 341.0, 495.6000000000001, 672.3, 2337.0, 0.20629487745418812, 16.20582171977281, 0.1410673798165972], "isController": false}, {"data": ["3.2 Nurse triage result-0", 93, 0, 0.0, 340.4193548387097, 162, 2153, 326.0, 442.8000000000002, 514.1999999999999, 2153.0, 0.2063493472260435, 0.15294839310992872, 0.1918967457265716], "isController": false}, {"data": ["4.0 Vaccination", 75, 1, 1.3333333333333333, 1431.6266666666675, 285, 4175, 1289.0, 2180.4, 2993.0000000000014, 4175.0, 0.1671868033883192, 8.53488195915069, 0.9279041740971912], "isController": true}, {"data": ["2.5 Patient return to consent page", 99, 0, 0.0, 283.0101010101011, 139, 2771, 207.0, 461.0, 557.0, 2771.0, 0.1992468870189647, 4.501095590580855, 0.13814969705416497], "isController": false}, {"data": ["1.5 Open Sessions list", 121, 0, 0.0, 148.6033057851239, 101, 2532, 122.0, 158.8, 251.99999999999991, 2045.5800000000024, 0.21806005842567847, 2.381624700617957, 0.1360147502536525], "isController": false}, {"data": ["4.2 Vaccination batch", 74, 0, 0.0, 387.41891891891896, 213, 2887, 262.0, 474.0, 972.5, 2887.0, 0.18164590830318175, 3.4626323184584153, 0.2880119376954534], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 64, 0, 0.0, 367.9843750000001, 172, 2299, 331.5, 516.0, 700.75, 2299.0, 0.17439547443743836, 0.1314778381501, 0.1672851120763416], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 64, 0, 0.0, 116.10937500000001, 94, 231, 111.0, 151.0, 165.75, 231.0, 0.17450722159963133, 0.13036916457394335, 0.11775829113803248], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 64, 0, 0.0, 274.14062499999994, 145, 980, 256.5, 381.0, 420.25, 980.0, 0.17436364082179764, 3.968488901515874, 0.12072638802993607], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 649.8999999999997, 337, 2313, 572.0, 993.4000000000003, 1266.6499999999987, 2310.1099999999988, 0.19662126026362978, 22.907528898409726, 0.12523084564837828], "isController": false}, {"data": ["4.1 Vaccination questions-0", 78, 0, 0.0, 227.39743589743594, 110, 2561, 148.5, 329.8000000000002, 436.59999999999985, 2561.0, 0.18844676378922956, 0.14059895267087047, 0.24970045571501048], "isController": false}, {"data": ["4.1 Vaccination questions-1", 78, 0, 0.0, 172.01282051282047, 102, 1599, 122.5, 168.20000000000002, 287.1999999999976, 1599.0, 0.18845996796180545, 2.052017405063291, 0.1294529707814565], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.03913894324853229], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2555, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 79, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
