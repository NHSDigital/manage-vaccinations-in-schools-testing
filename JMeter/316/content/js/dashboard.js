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

    var data = {"OkPercent": 99.9764982373678, "KoPercent": 0.023501762632197415};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8462269530507508, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.49398677089597115, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9903614457831326, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9907018596280743, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4914004914004914, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4825174825174825, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.1, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9838992974238876, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9024271844660194, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9885831381733021, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9841735052754983, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4925187032418953, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9344703770197487, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.38, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6985111662531017, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9914477703115455, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.18, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.47772567409144195, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.48621553884711777, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6153846153846154, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.98, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7087813620071685, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9911369193154034, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9853117505995204, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.98, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21275, 5, 0.023501762632197415, 238.28705052879027, 0, 20072, 117.0, 561.0, 701.0, 1148.0, 5.6323105869172085, 2354.7328169149273, 42.92551050632751], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 25, 0, 0.0, 106.72, 82, 180, 98.0, 160.40000000000003, 177.9, 180.0, 0.007503007955889516, 3.404472860982468, 0.0558833411314596], "isController": false}, {"data": ["2.0 Register attendance", 1663, 5, 0.30066145520144316, 960.9488875526148, 361, 4510, 910.0, 1381.4000000000005, 1571.9999999999998, 2184.0399999999986, 0.465932437835283, 976.8800541534389, 16.133775812425913], "isController": true}, {"data": ["2.5 Select patient", 1660, 0, 0.0, 118.88915662650618, 58, 1876, 99.0, 174.9000000000001, 250.94999999999982, 633.7299999999991, 0.4681342958851277, 210.2957288156541, 3.3830441590587794], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1798.7307692307688, 433, 9523, 819.5, 6364.800000000002, 9237.4, 9523.0, 0.007445432141472375, 3.411062764921362, 0.05505268412840048], "isController": false}, {"data": ["2.3 Search by first/last name", 1667, 0, 0.0, 122.995800839832, 64, 1262, 100.0, 171.20000000000005, 255.59999999999945, 697.9999999999984, 0.46703155082491166, 211.57091301822783, 3.4995073707531508], "isController": false}, {"data": ["4.0 Vaccination for flu", 407, 0, 0.0, 872.1572481572493, 231, 2172, 815.0, 1235.7999999999997, 1415.7999999999997, 1859.6000000000001, 0.11626369062089095, 153.43019096043378, 3.3086982938124865], "isController": true}, {"data": ["4.0 Vaccination for hpv", 429, 0, 0.0, 870.114219114219, 172, 2528, 795.0, 1242.0, 1503.0, 1830.5, 0.12317339454677789, 161.8714390143652, 3.503115202116343], "isController": true}, {"data": ["7.6 First name search", 25, 0, 0.0, 4203.12, 984, 20072, 2781.0, 11709.000000000007, 18142.699999999997, 20072.0, 0.007465904706386872, 4.146274170119897, 0.055152329560114864], "isController": false}, {"data": ["1.2 Sign-in page", 1708, 0, 0.0, 137.20140515222477, 15, 5674, 95.0, 183.0, 360.2999999999997, 782.0, 0.4749243819170595, 211.56287427145125, 4.037670513893623], "isController": false}, {"data": ["2.4 Patient attending session", 1030, 5, 0.4854368932038835, 418.5902912621354, 128, 2004, 378.5, 596.0, 723.0, 1053.2599999999968, 0.2900800508287841, 131.93095527347577, 2.5493609028664133], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.204545454545455, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 1708, 0, 0.0, 139.67857142857153, 26, 6034, 100.0, 194.3000000000004, 313.0999999999999, 725.6400000000003, 0.4749946465767292, 211.38542987641242, 4.029661452032633], "isController": false}, {"data": ["1.3 Sign-in", 1706, 0, 0.0, 152.94841735052782, 61, 5842, 97.0, 286.5999999999999, 393.64999999999986, 815.6700000000012, 0.47506361564067595, 211.84460309040577, 4.200592481133207], "isController": false}, {"data": ["Run some searches", 25, 0, 0.0, 13197.4, 4620, 36603, 9560.0, 32933.4, 35631.899999999994, 36603.0, 0.0074046013377448965, 29.930787548400176, 0.43965717093803564], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 401, 0, 0.0, 838.733167082294, 199, 2530, 772.0, 1199.4, 1403.1999999999998, 1926.1200000000008, 0.11609442153276484, 152.6129684240725, 3.301075766538027], "isController": true}, {"data": ["2.1 Open session", 1671, 0, 0.0, 319.6768402154396, 108, 2143, 272.0, 543.8, 670.3999999999999, 970.9999999999993, 0.4664360074082655, 208.44640661440312, 3.3741919889406375], "isController": false}, {"data": ["7.7 Partial name search", 25, 0, 0.0, 2330.96, 310, 9575, 1175.0, 6141.0, 8563.699999999997, 9575.0, 0.00745984069361002, 4.1432602120370206, 0.05510024832317701], "isController": false}, {"data": ["4.3 Vaccination confirm", 1612, 0, 0.0, 579.5130272952852, 333, 2294, 530.5, 860.7, 1063.35, 1537.2199999999993, 0.46677919172492, 207.83199633815778, 4.820956384541066], "isController": false}, {"data": ["4.1 Vaccination questions", 1637, 0, 0.0, 146.41356139279168, 78, 1737, 117.0, 214.0, 313.0999999999999, 613.2999999999984, 0.4675416960367773, 204.86156152768035, 4.392262556222104], "isController": false}, {"data": ["7.7 Last name search", 25, 0, 0.0, 2527.7999999999997, 677, 6508, 1979.0, 6214.2, 6431.2, 6508.0, 0.0074710228906164555, 4.15202710003356, 0.055193932625419044], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1706, 0, 0.0, 990.7022274325907, 267, 17550, 896.5, 1302.8999999999999, 1484.199999999999, 2181.900000000002, 0.47507446360584304, 870.852283148244, 15.638133089023412], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 399, 0, 0.0, 868.7293233082712, 236, 2448, 812.0, 1172.0, 1427.0, 1914.0, 0.11505037707112305, 151.8795262789911, 3.277467824731131], "isController": true}, {"data": ["7.0 Open Children Search", 26, 0, 0.0, 1362.9230769230771, 126, 5551, 629.0, 5205.9, 5440.75, 5551.0, 0.007389737303365485, 4.064016061896013, 0.05340461895530147], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.812686011904762, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 25, 0, 0.0, 1939.2800000000002, 1676, 3161, 1848.0, 2397.8000000000006, 2969.2999999999997, 3161.0, 0.007504458398734689, 4.173382336133397, 0.05607735852745116], "isController": false}, {"data": ["7.2 No Consent search", 25, 0, 0.0, 126.24000000000004, 79, 543, 101.0, 188.40000000000015, 448.4999999999998, 543.0, 0.007502291950190783, 3.4043783188264016, 0.056009884457201675], "isController": false}, {"data": ["Debug Sampler", 1667, 0, 0.0, 0.310137972405519, 0, 13, 0.0, 1.0, 1.0, 1.0, 0.4670503932525087, 2.6473099367387665, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1674, 0, 0.0, 571.4635603345278, 325, 2346, 557.0, 825.5, 911.25, 1235.75, 0.4667281907730569, 236.23645853953667, 3.3724826710779077], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1636, 0, 0.0, 145.14731051344705, 74, 1978, 113.5, 209.0, 322.0, 719.1499999999994, 0.46841840643829075, 206.19872792710683, 4.161391829706432], "isController": false}, {"data": ["2.2 Session register", 1668, 0, 0.0, 139.701438848921, 62, 2556, 101.0, 245.20000000000027, 348.0999999999999, 711.7099999999978, 0.466095466858321, 214.88696862924968, 3.3758318349281544], "isController": false}, {"data": ["7.3 Due vaccination", 25, 0, 0.0, 134.56000000000003, 77, 920, 99.0, 159.0000000000001, 702.4999999999995, 920.0, 0.00750482109707276, 3.4055256979896384, 0.05579424065769851], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.023501762632197415], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21275, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1030, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
