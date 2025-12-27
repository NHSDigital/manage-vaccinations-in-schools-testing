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

    var data = {"OkPercent": 99.79249011857708, "KoPercent": 0.2075098814229249};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7673739843811628, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.2161214953271028, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9858823529411764, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9889663182346109, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3349282296650718, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.32608695652173914, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9697142857142858, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.4355300859598854, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9749430523917996, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9667812142038946, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.31862745098039214, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9271676300578034, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.41209476309226933, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9842995169082126, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4581901489117984, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.29455445544554454, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.16666666666666666, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8526011560693642, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9781021897810219, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9791425260718424, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10120, 21, 0.2075098814229249, 471.5280632411057, 2, 29371, 140.0, 982.0, 1232.949999999999, 2627.789999999999, 5.17998131726106, 2121.80400099332, 24.996150084136307], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 6, 0, 0.0, 24522.166666666668, 23968, 25003, 24516.5, 25003.0, 25003.0, 25003.0, 0.003878875643246877, 1.5688183247782577, 0.017006697929326887], "isController": false}, {"data": ["2.0 Register attendance", 856, 21, 2.453271028037383, 1647.4310747663571, 472, 7567, 1557.0, 2361.500000000001, 2781.1499999999996, 4344.659999999982, 0.481693670961581, 949.7169589170798, 10.09788957257002], "isController": true}, {"data": ["2.5 Select patient", 850, 0, 0.0, 133.335294117647, 65, 1850, 93.0, 195.89999999999998, 334.6999999999996, 891.4900000000018, 0.4840064344384814, 196.83997348196365, 2.0162771630816976], "isController": false}, {"data": ["2.3 Search by first/last name", 861, 0, 0.0, 121.55052264808363, 62, 1559, 85.0, 197.60000000000014, 303.9, 822.7199999999998, 0.4847462570101008, 197.49773870410323, 2.098869305427863], "isController": false}, {"data": ["4.0 Vaccination for flu", 209, 0, 0.0, 1507.2488038277504, 208, 4311, 1371.0, 2175.0, 2656.0, 3408.7000000000007, 0.12275754562439832, 145.7522934075674, 2.0664389515418997], "isController": true}, {"data": ["4.0 Vaccination for hpv", 207, 0, 0.0, 1582.1352657004827, 211, 6573, 1390.0, 2101.2, 3104.6, 4401.639999999997, 0.12206556159003662, 144.67994081276058, 2.0575068109045236], "isController": true}, {"data": ["1.2 Sign-in page", 875, 0, 0.0, 325.5337142857147, 12, 25779, 106.0, 288.0, 547.3999999999982, 1638.9600000000064, 0.4873725938415042, 196.20964089308106, 2.3984475651143713], "isController": false}, {"data": ["7.1 Name search", 6, 0, 0.0, 5362.333333333333, 4384, 6397, 5133.5, 6397.0, 6397.0, 6397.0, 0.003929360575153605, 1.5893176301076777, 0.017043217768110096], "isController": false}, {"data": ["2.4 Patient attending session", 698, 21, 3.008595988538682, 1074.302292263611, 71, 6965, 926.0, 1516.0000000000002, 1937.6499999999994, 3353.21, 0.39567972164101645, 161.4574737922415, 2.0133655812778866], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 13.629415760869566, 25.64538043478261], "isController": false}, {"data": ["1.1 Homepage", 878, 0, 0.0, 324.7289293849653, 30, 24862, 112.0, 290.20000000000005, 450.04999999999995, 1728.100000000004, 0.4879664581415925, 196.23762062563495, 2.3879779304595], "isController": false}, {"data": ["1.3 Sign-in", 873, 0, 0.0, 351.9988545246272, 75, 24705, 116.0, 364.6, 530.3, 1860.279999999997, 0.4858799826352171, 195.95812731060838, 2.5471897410379354], "isController": false}, {"data": ["Run some searches", 6, 0, 0.0, 105809.66666666667, 102751, 108394, 105616.5, 108394.0, 108394.0, 108394.0, 0.0036925712850886584, 8.278128791616817, 0.08085072342087189], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 204, 0, 0.0, 1563.9362745098042, 214, 5266, 1400.0, 2278.0, 2688.5, 4233.199999999992, 0.12067549885121658, 143.0880190737904, 2.0238425430231817], "isController": true}, {"data": ["2.1 Open session", 865, 0, 0.0, 361.4878612716761, 166, 3581, 279.0, 562.4, 827.5999999999995, 1544.200000000001, 0.48443778614731947, 195.00335424600618, 2.019882863363342], "isController": false}, {"data": ["4.3 Vaccination confirm", 802, 0, 0.0, 1270.4127182044892, 818, 6456, 1072.0, 1829.2000000000003, 2407.7, 3569.840000000002, 0.48112975505576183, 194.33822290851785, 2.9071749665173883], "isController": false}, {"data": ["4.1 Vaccination questions", 828, 0, 0.0, 164.73550724637684, 87, 1788, 121.0, 259.1, 354.0999999999999, 846.5700000000024, 0.4841023818071051, 191.0988670951869, 2.768550707897417], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 873, 0, 0.0, 1500.2852233676963, 456, 75346, 874.0, 1414.8000000000002, 1935.599999999999, 4303.319999999991, 0.4856904899799214, 808.1055097696878, 9.316100292026276], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 202, 0, 0.0, 1627.5000000000002, 244, 6749, 1430.5, 2452.5000000000005, 2877.85, 4868.32, 0.1188372306454156, 141.01030349951375, 2.000095603853444], "isController": true}, {"data": ["7.0 Open Children Search", 6, 0, 0.0, 19903.666666666664, 67, 25088, 23567.0, 25088.0, 25088.0, 25088.0, 0.003948285358375991, 1.8942490221413264, 0.016424198761291274], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 6, 0, 0.0, 23743.666666666668, 23583, 23967, 23756.5, 23967.0, 23967.0, 23967.0, 0.003878095932459081, 1.927165616631796, 0.017080916996789583], "isController": false}, {"data": ["7.2 No Consent search", 6, 0, 0.0, 27573.666666666668, 26495, 29371, 27365.0, 29371.0, 29371.0, 29371.0, 0.0038738368804766363, 2.0590275289375612, 0.017041351433190518], "isController": false}, {"data": ["1.4 Open Sessions list", 865, 0, 0.0, 501.2971098265896, 362, 2626, 442.0, 645.0, 745.7999999999997, 1559.8200000000006, 0.4845783636040754, 222.90060603631986, 2.0173096407075515], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 822, 0, 0.0, 165.6690997566912, 86, 3551, 114.0, 243.0, 398.24999999999955, 928.77, 0.4826994526470075, 191.816035988195, 2.5141577112925835], "isController": false}, {"data": ["2.2 Session register", 863, 0, 0.0, 156.013904982619, 60, 1782, 88.0, 308.20000000000005, 396.79999999999995, 1133.120000000002, 0.4849172746862507, 206.05847317256988, 2.0261277364393138], "isController": false}, {"data": ["7.3 Due vaccination", 6, 0, 0.0, 24607.833333333336, 24321, 24949, 24605.5, 24949.0, 24949.0, 24949.0, 0.0038798689121623546, 1.5692187912236073, 0.016955481818287634], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, 100.0, 0.2075098814229249], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10120, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 698, 21, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
