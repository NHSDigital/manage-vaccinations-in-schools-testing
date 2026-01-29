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

    var data = {"OkPercent": 99.93418578412937, "KoPercent": 0.06581421587062805};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7829791271347248, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.31112433075550266, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9826968973747017, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5178571428571429, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9842636579572447, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.422029702970297, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.43039443155452434, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.375, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9733023795705166, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.55527950310559, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9751157407407407, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9688953488372093, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4362745098039216, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6708111308466548, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5178571428571429, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.47114794352363415, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9757869249394673, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3392857142857143, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4441860465116279, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.41748768472906406, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5172413793103449, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.744378698224852, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.969981807155852, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9819098457888493, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9821428571428571, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21272, 14, 0.06581421587062805, 306.0313087626917, 0, 8993, 123.0, 748.0, 972.0, 1811.950000000008, 5.556935733432184, 2309.3374174326, 41.71289944516523], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 28, 0, 0.0, 114.96428571428571, 82, 392, 102.0, 128.50000000000003, 279.4999999999993, 392.0, 0.008092347558235279, 3.6500438829222275, 0.059476440195817465], "isController": false}, {"data": ["2.0 Register attendance", 1681, 8, 0.4759071980963712, 1482.8953004164177, 407, 7206, 1334.0, 2347.8, 2794.0999999999985, 4380.900000000001, 0.4706381696794789, 950.5031186187547, 15.499172785085362], "isController": true}, {"data": ["2.5 Select patient", 1676, 0, 0.0, 139.17064439140802, 68, 3423, 94.0, 189.49999999999977, 318.0, 1062.38, 0.4726536314660977, 211.04752028518837, 3.3693767419584724], "isController": false}, {"data": ["7.1 Full name search", 28, 0, 0.0, 1130.4999999999998, 350, 5234, 877.5, 1967.4000000000042, 4968.499999999998, 5234.0, 0.008088649285122288, 3.683130567626741, 0.05902214486207553], "isController": false}, {"data": ["2.3 Search by first/last name", 1684, 0, 0.0, 141.92042755344397, 78, 1853, 103.0, 206.5, 343.0, 766.1500000000019, 0.47139996271349466, 212.27528754890355, 3.485988148290419], "isController": false}, {"data": ["4.0 Vaccination for flu", 404, 0, 0.0, 1165.477722772276, 238, 5425, 999.5, 1747.5, 2207.75, 3302.449999999995, 0.11546845753290208, 151.33674534378446, 3.246026404192191], "isController": true}, {"data": ["4.0 Vaccination for hpv", 431, 0, 0.0, 1167.9187935034795, 185, 5749, 972.0, 1729.0, 2054.7999999999993, 3975.6000000000017, 0.12335467474148466, 161.408213136611, 3.4685449939574813], "isController": true}, {"data": ["7.6 First name search", 28, 0, 0.0, 1625.4642857142853, 585, 6575, 1166.0, 4446.700000000001, 5935.999999999996, 6575.0, 0.008097123843774093, 4.448337360899365, 0.05902100657804557], "isController": false}, {"data": ["1.2 Sign-in page", 1723, 0, 0.0, 170.60708067324455, 14, 5135, 108.0, 308.60000000000014, 496.5999999999997, 1065.52, 0.47912483941114636, 212.79956354895458, 4.020424612396903], "isController": false}, {"data": ["2.4 Patient attending session", 805, 8, 0.9937888198757764, 712.950310559006, 24, 4602, 593.0, 1034.1999999999998, 1363.1999999999996, 2673.699999999982, 0.22665923712413633, 102.49609205291536, 1.9636638626267637], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.195591517857142, 21.065848214285715], "isController": false}, {"data": ["1.1 Homepage", 1728, 0, 0.0, 170.77025462962956, 29, 4860, 110.0, 238.10000000000014, 451.0499999999995, 1218.9000000000033, 0.48003493587588875, 212.9971494084257, 4.019704166230293], "isController": false}, {"data": ["1.3 Sign-in", 1720, 0, 0.0, 193.6209302325581, 75, 4913, 114.0, 338.0, 571.8999999999996, 1315.699999999999, 0.47894694047580594, 212.93236507575645, 4.179621594760349], "isController": false}, {"data": ["Run some searches", 28, 0, 0.0, 8114.392857142856, 5067, 20693, 6626.0, 15071.400000000005, 19570.249999999993, 20693.0, 0.008070845885180112, 32.368491105999894, 0.4728819848487163], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 408, 1, 0.24509803921568626, 1133.3921568627452, 95, 4894, 994.5, 1664.0000000000002, 1946.3499999999992, 3137.7699999999986, 0.11774779634133355, 154.60107089889186, 3.306168064001844], "isController": true}, {"data": ["2.1 Open session", 1689, 0, 0.0, 699.1113084665487, 131, 6092, 567.0, 1331.0, 1607.0, 2548.4999999999977, 0.4713600621558988, 209.42269503115608, 3.3636965636693303], "isController": false}, {"data": ["7.7 Partial name search", 28, 0, 0.0, 1110.1428571428569, 423, 5551, 942.5, 1505.500000000002, 4307.649999999992, 5551.0, 0.008124200455361436, 4.465539374463404, 0.05921043779140129], "isController": false}, {"data": ["4.3 Vaccination confirm", 1629, 2, 0.12277470841006753, 822.3308778391637, 35, 8993, 675.0, 1210.0, 1542.0, 3059.8000000000097, 0.470312430077476, 208.72741056999396, 4.791300268881427], "isController": false}, {"data": ["4.1 Vaccination questions", 1652, 2, 0.12106537530266344, 179.25423728813524, 28, 2710, 122.0, 310.0, 477.74999999999955, 961.3400000000006, 0.47113795215839366, 204.7604094536739, 4.369789411121052], "isController": false}, {"data": ["7.7 Last name search", 28, 0, 0.0, 1831.4999999999998, 854, 7087, 1147.0, 5756.700000000002, 6867.8499999999985, 7087.0, 0.008106956231701441, 4.470187315385787, 0.059099744858886846], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1720, 0, 0.0, 1065.3552325581404, 422, 14908, 918.0, 1549.9, 1894.7999999999993, 3541.4899999999916, 0.47898121808822447, 875.0614127087189, 15.563875015055187], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 406, 1, 0.24630541871921183, 1200.2044334975367, 141, 10146, 1009.0, 1710.1000000000001, 2184.4499999999985, 4535.670000000009, 0.11670476339402748, 153.01235204536238, 3.2799135139732396], "isController": true}, {"data": ["7.0 Open Children Search", 29, 0, 0.0, 903.4827586206897, 356, 4999, 639.0, 1421.0, 3933.0, 4999.0, 0.008103965493873821, 4.413781306369717, 0.0577658607179834], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 28, 0, 0.0, 2025.6071428571427, 1684, 3912, 1912.0, 2326.2000000000003, 3268.049999999996, 3912.0, 0.008090448907225956, 4.462854374303463, 0.05966000637917449], "isController": false}, {"data": ["7.2 No Consent search", 28, 0, 0.0, 131.0, 84, 449, 96.5, 347.90000000000003, 415.2499999999998, 449.0, 0.008092057558805415, 3.649913079019231, 0.05961655198222175], "isController": false}, {"data": ["Debug Sampler", 1684, 0, 0.0, 0.30285035629453766, 0, 16, 0.0, 1.0, 1.0, 1.0, 0.471420021241895, 2.6812609675490022, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1690, 0, 0.0, 539.52899408284, 306, 3846, 500.5, 792.8000000000002, 894.0, 1548.3599999999997, 0.47105466631212134, 237.0628609648008, 3.357554715159654], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1649, 2, 0.1212856276531231, 175.05942995755012, 23, 4631, 111.0, 286.0, 540.0, 1071.5, 0.47141479613525633, 206.3571236812214, 4.131743637883539], "isController": false}, {"data": ["2.2 Session register", 1686, 0, 0.0, 160.52846975088946, 75, 6280, 101.0, 312.5999999999999, 416.64999999999986, 808.5999999999976, 0.47169032718690435, 215.8212949696122, 3.3701953454711995], "isController": false}, {"data": ["7.3 Due vaccination", 28, 0, 0.0, 145.21428571428572, 85, 652, 99.0, 357.10000000000014, 552.0999999999993, 652.0, 0.00809383296178786, 3.6507138724539114, 0.05937669961458902], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 2, 14.285714285714286, 0.009402030838661151], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 2, 14.285714285714286, 0.009402030838661151], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 57.142857142857146, 0.037608123354644606], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 2, 14.285714285714286, 0.009402030838661151], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21272, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "Test failed: text expected to contain /Check and confirm/", 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 805, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1629, 2, "Test failed: text expected to contain /Vaccination outcome recorded for/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1652, 2, "Test failed: text expected to contain /Which batch did you use?/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1649, 2, "Test failed: text expected to contain /Check and confirm/", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
