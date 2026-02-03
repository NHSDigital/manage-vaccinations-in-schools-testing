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

    var data = {"OkPercent": 99.97049712346954, "KoPercent": 0.02950287653046172};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6499663885483807, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3372744243932794, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8572303921568627, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.07966203983101991, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.2201917315757939, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.19077306733167082, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9036253776435045, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9345991561181435, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.18447837150127228, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.19605568445475638, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8821065230400957, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.38114754098360654, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.5147058823529411, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8671586715867159, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8998211091234347, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8750748951467945, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9066265060240963, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.185785536159601, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.34705528846153844, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20337, 6, 0.02950287653046172, 611.1601514481018, 0, 13967, 212.0, 1569.0, 2295.9500000000007, 4647.980000000003, 5.163975324033928, 1740.7513220812032, 38.66589994004309], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1607, 0, 0.0, 1654.395146235219, 526, 13967, 1066.0, 3272.200000000001, 4985.599999999999, 8415.760000000002, 0.46200398180158553, 165.93292198382125, 4.708324835768654], "isController": false}, {"data": ["4.1 Vaccination questions", 1632, 0, 0.0, 444.1225490196077, 82, 10119, 180.0, 1100.5000000000002, 1902.499999999999, 3098.090000000002, 0.4634297950714582, 162.84901806863292, 4.299167346465453], "isController": false}, {"data": ["2.0 Register attendance", 1657, 5, 0.30175015087507545, 2939.6789378394756, 433, 16678, 2441.0, 5109.8, 6616.599999999999, 10375.300000000005, 0.46428715530111137, 736.8593199652829, 14.55334740978133], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1669, 1, 0.05991611743559017, 2075.6980227681247, 422, 12028, 1628.0, 3749.0, 4833.0, 7224.799999999996, 0.46472994846203347, 693.802629363613, 15.14515064375122], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 401, 0, 0.0, 2456.0698254364083, 310, 14018, 1787.0, 4641.200000000001, 6367.399999999998, 9907.14000000003, 0.11523379241020242, 121.2778071232911, 3.240037519142172], "isController": true}, {"data": ["2.5 Select patient", 1655, 0, 0.0, 326.851963746224, 63, 6342, 135.0, 776.2000000000003, 1377.3999999999996, 2833.640000000006, 0.4652673037970591, 169.2123827189919, 3.3167234472582265], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["2.3 Search by first/last name", 1659, 0, 0.0, 267.84267631103006, 70, 4692, 132.0, 539.0, 1047.0, 2264.6000000000013, 0.46487724886821025, 170.4694155004863, 3.437749928002171], "isController": false}, {"data": ["4.0 Vaccination for flu", 393, 0, 0.0, 2534.5267175572526, 399, 13162, 1780.0, 4894.0, 6482.799999999996, 10988.26, 0.1124410113854392, 119.17812880704378, 3.1606105113283602], "isController": true}, {"data": ["4.0 Vaccination for hpv", 431, 0, 0.0, 2507.7726218097437, 279, 15383, 1843.0, 4888.200000000001, 6605.799999999993, 11560.76, 0.12394520759096816, 131.34279090970102, 3.485165040610748], "isController": true}, {"data": ["1.2 Sign-in page", 1671, 0, 0.0, 376.5637342908438, 15, 5453, 161.0, 941.3999999999996, 1487.1999999999948, 3080.3999999999996, 0.46476272486130127, 165.82354624797622, 3.8970941060903668], "isController": false}, {"data": ["Debug Sampler", 1659, 0, 0.0, 0.2911392405063295, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.46493913332991427, 2.5788883709761676, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 488, 5, 1.0245901639344261, 1398.3340163934429, 197, 10955, 874.0, 2650.1000000000004, 4150.049999999995, 8709.2, 0.1506229555557339, 57.14500175141625, 1.304856593944278], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 8.707682291666668, 16.38454861111111], "isController": false}, {"data": ["1.4 Open Sessions list", 1666, 0, 0.0, 934.0876350540213, 389, 6403, 738.0, 1564.3, 2076.6499999999996, 3734.189999999997, 0.4644944719302868, 194.02743594729967, 3.310781016715946], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1626, 0, 0.0, 427.52829028290284, 82, 7509, 176.0, 1027.8999999999999, 1655.4999999999986, 3526.6800000000003, 0.4632478632478632, 164.30132712339744, 4.0609820156695156], "isController": false}, {"data": ["1.1 Homepage", 1677, 0, 0.0, 362.41025641025635, 28, 9100, 159.0, 810.0, 1486.1, 3159.7800000000016, 0.4657272510150466, 167.25610796204057, 3.89707321656942], "isController": false}, {"data": ["1.3 Sign-in", 1669, 1, 0.05991611743559017, 404.1342121030558, 73, 6479, 170.0, 950.0, 1515.5, 3299.899999999994, 0.4648448869151317, 167.2997796168894, 4.054710445014476], "isController": false}, {"data": ["2.2 Session register", 1660, 0, 0.0, 350.16265060240903, 68, 7107, 136.0, 739.0, 1454.4499999999944, 3458.9499999999994, 0.4645054849423272, 175.20429928639294, 3.318436486342699], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 401, 0, 0.0, 2530.471321695762, 242, 14211, 1850.0, 5202.0, 6354.799999999997, 9674.38000000001, 0.11529329637047503, 123.6890472388226, 3.2415418503524642], "isController": true}, {"data": ["2.1 Open session", 1664, 0, 0.0, 1582.5432692307693, 136, 10040, 1289.0, 3031.0, 3701.75, 6133.049999999999, 0.4645182326197879, 168.15631227831398, 3.3144508993724817], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 83.33333333333333, 0.024585730442051434], "isController": false}, {"data": ["Assertion failed", 1, 16.666666666666668, 0.004917146088410287], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20337, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 488, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 1669, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
