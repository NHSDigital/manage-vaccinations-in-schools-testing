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

    var data = {"OkPercent": 99.94814989394297, "KoPercent": 0.05185010605703512};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.822969251950436, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9807692307692307, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3528510116492949, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9923218673218673, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9941896024464831, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4845605700712589, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4962962962962963, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.23076923076923078, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.986268656716418, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7518628912071535, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.986881335718545, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9808612440191388, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.48333333333333334, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7486288848263254, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4423076923076923, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5582278481012658, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9885021752641392, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.21153846153846154, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4880382775119617, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4884020618556701, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5370370370370371, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8973187081048142, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9903366583541147, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9893031784841075, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21215, 11, 0.05185010605703512, 256.2733443318414, 0, 13485, 109.0, 591.0, 727.0, 1117.9900000000016, 5.497831705968237, 2304.3381536332176, 41.93845673917162], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 114.61538461538463, 78, 531, 91.5, 150.00000000000006, 422.1499999999995, 531.0, 0.00770006242973693, 3.494893021514863, 0.057277601558640714], "isController": false}, {"data": ["2.0 Register attendance", 1631, 7, 0.4291845493562232, 1352.5977927651777, 568, 3770, 1308.0, 1817.6, 2010.7999999999984, 2513.800000000004, 0.4568926926862993, 1000.5801054803907, 16.614243872182378], "isController": true}, {"data": ["2.5 Select patient", 1628, 0, 0.0, 116.72297297297288, 60, 1496, 94.0, 159.0, 265.0999999999999, 707.4300000000012, 0.45852528916243934, 206.0481011938451, 3.309146584944204], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1785.2592592592591, 352, 8777, 677.0, 5035.0, 7379.399999999992, 8777.0, 0.007670981925461921, 3.5170858381812047, 0.05665783698765654], "isController": false}, {"data": ["2.3 Search by first/last name", 1635, 0, 0.0, 111.24281345565743, 64, 1728, 91.0, 145.4000000000001, 223.79999999999927, 557.5199999999913, 0.4575984004486983, 207.34995166310782, 3.424293580720078], "isController": false}, {"data": ["4.0 Vaccination for flu", 421, 1, 0.2375296912114014, 912.3657957244654, 181, 3686, 819.0, 1228.2, 1481.8999999999996, 2059.5599999999986, 0.12013479066441388, 157.9434016215914, 3.4044295370216333], "isController": true}, {"data": ["4.0 Vaccination for hpv", 405, 0, 0.0, 887.535802469136, 181, 2174, 827.0, 1172.4, 1353.4999999999998, 1744.9399999999998, 0.11601087580477175, 152.58318943195704, 3.2969072946170668], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 2245.884615384615, 771, 8447, 1552.5, 4497.200000000001, 7393.849999999996, 8447.0, 0.00769445212245543, 4.261402546859953, 0.056770571765119154], "isController": false}, {"data": ["1.2 Sign-in page", 1675, 0, 0.0, 138.2364179104477, 13, 6321, 94.0, 185.4000000000001, 301.39999999999964, 764.9200000000003, 0.4657509030701465, 208.1147581615373, 3.9525706543251022], "isController": false}, {"data": ["2.4 Patient attending session", 1342, 7, 0.5216095380029806, 553.2101341281673, 29, 2323, 498.0, 752.7, 879.8499999999999, 1268.2799999999997, 0.3786587691953473, 172.04723280097022, 3.3231712440901577], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 1677, 0, 0.0, 136.37924865831843, 26, 6051, 95.0, 167.20000000000005, 266.59999999999945, 772.140000000001, 0.46587513268551595, 207.964658128962, 3.9452134568254316], "isController": false}, {"data": ["1.3 Sign-in", 1672, 0, 0.0, 154.42344497607664, 62, 5749, 100.0, 278.4000000000001, 355.74999999999955, 764.0, 0.46551992478178056, 208.22248379755047, 4.110612107193202], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 11372.884615384617, 4519, 30500, 9358.0, 19724.000000000004, 28176.34999999999, 30500.0, 0.007688709012527273, 31.02999503080215, 0.45597937315286163], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 390, 0, 0.0, 935.2820512820523, 206, 2117, 862.5, 1256.8000000000002, 1459.2999999999997, 1806.6999999999994, 0.11311685667398155, 149.69311976870793, 3.2206430554625], "isController": true}, {"data": ["2.1 Open session", 1641, 0, 0.0, 536.8580134064595, 113, 1958, 502.0, 853.3999999999999, 951.8999999999999, 1203.58, 0.4584305973509919, 204.90040697413738, 3.3114519157531115], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1816.6923076923076, 305, 6291, 927.0, 5656.6, 6177.25, 6291.0, 0.007698794724075197, 4.256722997939536, 0.056795093635850565], "isController": false}, {"data": ["4.3 Vaccination confirm", 1580, 1, 0.06329113924050633, 650.9063291139227, 403, 2827, 586.0, 882.7000000000003, 1065.9499999999998, 1425.2700000000018, 0.45660134281253134, 203.95040220292807, 4.708777263597544], "isController": false}, {"data": ["4.1 Vaccination questions", 1609, 1, 0.062150403977625855, 141.7750155376011, 59, 2053, 108.0, 207.0, 307.5, 705.5000000000005, 0.4577860907002562, 200.26160137162984, 4.294638382685699], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 3271.423076923077, 700, 13485, 2172.0, 7574.100000000001, 11829.499999999993, 13485.0, 0.007695574896442721, 4.265948466194227, 0.05680169039962232], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1672, 1, 0.05980861244019139, 854.6866028708139, 256, 18121, 739.5, 1050.7, 1272.0499999999997, 2012.009999999997, 0.46550929696124327, 855.296249828601, 15.299118097665772], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 388, 0, 0.0, 901.4845360824743, 184, 2664, 824.0, 1224.8000000000002, 1430.1999999999998, 1919.3000000000018, 0.11167389380963975, 147.1755944440223, 3.1737714886799226], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1480.6296296296293, 269, 6218, 531.0, 5245.8, 5847.999999999998, 6218.0, 0.0077176109020686634, 4.227381944581408, 0.05570033817427623], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1878.1923076923076, 1655, 2764, 1803.0, 2217.1000000000004, 2623.2999999999993, 2764.0, 0.007691650033473469, 4.264407188538465, 0.057402809622934606], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 114.11538461538464, 79, 393, 90.0, 231.9000000000001, 371.6499999999999, 393.0, 0.007698831198980438, 3.4947876090495025, 0.05740377395594966], "isController": false}, {"data": ["Debug Sampler", 1635, 0, 0.0, 0.3088685015290521, 0, 19, 0.0, 1.0, 1.0, 1.0, 0.4576660319991132, 2.6280331440130844, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1641, 1, 0.06093845216331505, 433.5898842169406, 319, 2439, 395.0, 550.0, 613.0, 847.3799999999956, 0.45821183459809295, 231.94416770774782, 3.306079766083696], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1604, 1, 0.06234413965087282, 126.05798004987531, 23, 1533, 97.0, 181.5, 285.0, 609.8500000000001, 0.4572146562951532, 201.3018534403265, 4.0560748059403124], "isController": false}, {"data": ["2.2 Session register", 1636, 0, 0.0, 132.12530562347192, 61, 2401, 91.0, 265.29999999999995, 343.2999999999997, 598.0, 0.45739975508423875, 211.18229480834853, 3.308010795095534], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 92.65384615384616, 76, 190, 87.5, 112.9, 163.7499999999999, 190.0, 0.007698357052168804, 3.494118698099009, 0.05715966498008494], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 1, 9.090909090909092, 0.0047136460051850106], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 1, 9.090909090909092, 0.0047136460051850106], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 63.63636363636363, 0.03299552203629508], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 1, 9.090909090909092, 0.0047136460051850106], "isController": false}, {"data": ["Assertion failed", 1, 9.090909090909092, 0.0047136460051850106], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21215, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "Test failed: text expected to contain /Check and confirm/", 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "Assertion failed", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1342, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1580, 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1609, 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1641, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1604, 1, "Test failed: text expected to contain /Check and confirm/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
