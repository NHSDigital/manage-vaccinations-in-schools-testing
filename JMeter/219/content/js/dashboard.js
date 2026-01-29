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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6709149845292471, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.19086021505376344, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9460196292257361, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.923692636072572, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.18518518518518517, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.20276497695852536, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8329864724245577, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.3637316561844864, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8329864724245577, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.809375, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.19078947368421054, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6884288747346072, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.2777142857142857, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.956081081081081, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.2838541666666667, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.19111111111111112, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.375, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.2, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.7730646871686108, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9616252821670429, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8910733262486716, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10783, 0, 0.0, 673.7023091903939, 2, 14275, 229.0, 1588.4000000000015, 2797.0, 6474.8399999999965, 5.750454895486029, 2355.090418456351, 27.648623072060406], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 15, 0, 0.0, 95.33333333333331, 60, 248, 70.0, 198.8, 248.0, 248.0, 0.008946715153886483, 3.615949479651591, 0.03916343013032978], "isController": false}, {"data": ["2.0 Register attendance", 930, 0, 0.0, 2602.987096774193, 499, 16869, 1838.0, 5495.099999999999, 8574.449999999999, 13119.859999999964, 0.5248671324251063, 964.7110318958371, 10.163063925289396], "isController": true}, {"data": ["2.5 Select patient", 917, 0, 0.0, 231.16902944383835, 57, 7267, 95.0, 429.4000000000001, 847.1999999999989, 2885.959999999976, 0.5218060292780412, 212.22890057119835, 2.168131147545065], "isController": false}, {"data": ["2.3 Search by first/last name", 937, 0, 0.0, 293.7801494130205, 58, 5794, 100.0, 605.8000000000004, 1133.3999999999978, 3639.92, 0.5289983695333071, 215.31379863418775, 2.284658682079884], "isController": false}, {"data": ["4.0 Vaccination for flu", 216, 0, 0.0, 2693.259259259258, 843, 13025, 1781.5, 6049.300000000002, 9284.849999999993, 11743.469999999985, 0.13182612134594468, 157.54210804672596, 2.229054885286862], "isController": true}, {"data": ["4.0 Vaccination for hpv", 217, 0, 0.0, 2730.866359447004, 868, 14536, 1766.0, 6648.2, 9313.399999999998, 13519.17999999998, 0.12948374770121596, 154.23984767889195, 2.1889150397535992], "isController": true}, {"data": ["1.2 Sign-in page", 961, 0, 0.0, 538.1123829344439, 13, 7715, 165.0, 1422.6000000000004, 2679.299999999998, 5333.639999999998, 0.5357900505850481, 216.246366926352, 2.637246283757979], "isController": false}, {"data": ["7.1 Name search", 15, 0, 0.0, 6708.533333333335, 5468, 8256, 6666.0, 7938.6, 8256.0, 8256.0, 0.008924337680279058, 3.6070912108585986, 0.03859369338623284], "isController": false}, {"data": ["2.4 Patient attending session", 477, 0, 0.0, 1473.2389937106916, 593, 13114, 1039.0, 2520.0, 3499.6999999999966, 8540.08, 0.271655251830683, 110.82479461588687, 1.385600957335603], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.610243055555555, 21.846064814814817], "isController": false}, {"data": ["1.1 Homepage", 961, 0, 0.0, 540.3319458896985, 28, 6871, 155.0, 1467.4000000000012, 2635.2, 5047.919999999998, 0.5358384477747092, 216.03292198166412, 2.623478465887833], "isController": false}, {"data": ["1.3 Sign-in", 960, 0, 0.0, 634.7020833333332, 66, 8244, 178.0, 1640.7999999999997, 3113.4499999999994, 5874.209999999999, 0.536385066369271, 216.83279442232165, 2.804139215636016], "isController": false}, {"data": ["Run some searches", 15, 0, 0.0, 10686.733333333334, 9056, 12823, 10736.0, 12390.4, 12823.0, 12823.0, 0.00889277799713297, 19.923855148392306, 0.19436625284124256], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 228, 0, 0.0, 2741.144736842105, 406, 14146, 1797.5, 5721.399999999997, 9540.14999999999, 12259.230000000003, 0.1334712536287497, 158.45649239594366, 2.2362163215585933], "isController": true}, {"data": ["2.1 Open session", 942, 0, 0.0, 867.2738853503189, 185, 6573, 499.0, 1875.000000000001, 3144.499999999999, 5395.109999999999, 0.5286542382412314, 213.13695138881874, 2.1998772243323494], "isController": false}, {"data": ["4.3 Vaccination confirm", 875, 0, 0.0, 2257.0777142857146, 642, 14275, 1347.0, 5145.599999999999, 8791.19999999999, 11766.12, 0.5245611521401197, 211.91032675813415, 3.162032378087492], "isController": false}, {"data": ["4.1 Vaccination questions", 888, 0, 0.0, 230.91103603603582, 68, 10660, 113.5, 374.1, 693.7499999999998, 2078.6600000000026, 0.5180213683814457, 204.50770970604623, 2.9561932320333213], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 960, 0, 0.0, 2391.070833333332, 353, 19159, 1313.0, 6047.299999999999, 8304.9, 12669.55, 0.536492379293406, 892.0824638690195, 10.260238294302114], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 225, 0, 0.0, 2471.7155555555546, 201, 13769, 1782.0, 4397.6, 8237.899999999998, 12595.880000000005, 0.13298265315168886, 158.42893462425013, 2.2421596798442627], "isController": true}, {"data": ["7.0 Open Children Search", 16, 0, 0.0, 1428.125, 57, 1933, 1441.0, 1776.2000000000003, 1933.0, 1933.0, 0.008946729495074544, 4.374286161946707, 0.037155903017172684], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 15, 0, 0.0, 1616.5333333333333, 1376, 2519, 1513.0, 2361.2000000000003, 2519.0, 2519.0, 0.008951397492176478, 4.4457500275255475, 0.039376241819914594], "isController": false}, {"data": ["7.2 No Consent search", 15, 0, 0.0, 1894.8666666666668, 1626, 2706, 1782.0, 2452.2000000000003, 2706.0, 2706.0, 0.008944218486984075, 4.751913047214741, 0.039283520024018206], "isController": false}, {"data": ["1.4 Open Sessions list", 943, 0, 0.0, 689.3913043478261, 327, 6820, 442.0, 1186.8000000000002, 2016.999999999998, 4490.879999999996, 0.5286899813528857, 243.1591858579004, 2.1953364851731334], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 886, 0, 0.0, 198.3002257336346, 62, 5630, 103.0, 345.30000000000007, 594.3, 1856.1599999999999, 0.5186943654921888, 206.13138790625447, 2.6951909538765966], "isController": false}, {"data": ["2.2 Session register", 941, 0, 0.0, 449.34218916046774, 55, 7717, 112.0, 789.6000000000005, 2330.499999999999, 6228.680000000008, 0.5296416391761456, 221.06518911154444, 2.2086379112813668], "isController": false}, {"data": ["7.3 Due vaccination", 15, 0, 0.0, 371.4666666666666, 254, 1145, 274.0, 837.2000000000002, 1145.0, 1145.0, 0.00895086868180557, 3.617628190425256, 0.03905923666245976], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10783, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
