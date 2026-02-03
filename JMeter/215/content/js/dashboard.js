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

    var data = {"OkPercent": 99.97385210752013, "KoPercent": 0.02614789247986612};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6823375436263919, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9642857142857143, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.1726993865030675, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9526445264452644, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9706780696395846, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.10767326732673267, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.10583941605839416, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9134443783462225, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.29588431590656283, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9227110582639715, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9092261904761905, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.10024449877750612, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6970248937462052, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.25960932577189666, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.920758234928527, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.34017857142857144, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.09375, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.034482758620689655, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.7487878787878788, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.931592039800995, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.945830797321972, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9107142857142857, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19122, 5, 0.02614789247986612, 535.8274239096336, 2, 14086, 235.0, 1368.7000000000007, 1898.699999999997, 3458.0800000000017, 5.0974668612671685, 2090.2746941040045, 24.655472868391413], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 28, 0, 0.0, 157.7142857142857, 61, 952, 82.5, 494.70000000000056, 906.9999999999998, 952.0, 0.008152142266528469, 3.2950582596122495, 0.035800676391250424], "isController": false}, {"data": ["2.0 Register attendance", 1630, 4, 0.24539877300613497, 2173.8202453987715, 502, 10395, 1936.0, 3847.9, 4595.049999999998, 6390.330000000004, 0.45665682379770384, 851.1479970397852, 8.975920205961332], "isController": true}, {"data": ["2.5 Select patient", 1626, 0, 0.0, 213.20787207872056, 61, 1978, 113.0, 462.0, 779.5999999999995, 1444.6000000000004, 0.4568077844991016, 185.85357489228073, 1.903448898334], "isController": false}, {"data": ["2.3 Search by first/last name", 1637, 0, 0.0, 174.3585827733659, 60, 2914, 106.0, 322.4000000000001, 536.0999999999999, 1260.9199999999983, 0.45881137863430044, 186.78575341796258, 1.9869819803722903], "isController": false}, {"data": ["4.0 Vaccination for flu", 404, 0, 0.0, 2279.3341584158425, 303, 7690, 1937.0, 3784.0, 4500.75, 6063.099999999997, 0.11499016321772079, 136.51807479836162, 1.9362073568657097], "isController": true}, {"data": ["4.0 Vaccination for hpv", 411, 0, 0.0, 2304.2700729927, 220, 9176, 1990.0, 3653.4, 4435.0, 7299.199999999998, 0.1176670320738571, 139.59036724952526, 1.9860016156492284], "isController": true}, {"data": ["1.2 Sign-in page", 1681, 0, 0.0, 286.86793575252796, 13, 3301, 136.0, 680.0, 1121.9999999999986, 2081.1600000000008, 0.46744928967729593, 188.83747067275365, 2.329026579174258], "isController": false}, {"data": ["7.1 Name search", 28, 0, 0.0, 7312.857142857142, 5808, 14086, 7243.5, 8784.2, 11709.099999999984, 14086.0, 0.008114824770502613, 3.2803245160086654, 0.03521027901955528], "isController": false}, {"data": ["2.4 Patient attending session", 899, 4, 0.44493882091212456, 1558.2191323692994, 107, 6805, 1266.0, 2505.0, 3224.0, 4736.0, 0.2619818063980678, 106.99821353460592, 1.3386418374308182], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1682, 0, 0.0, 283.71700356718276, 26, 5187, 143.0, 594.7, 1066.3999999999978, 2023.9100000000017, 0.46752455476763866, 188.75784737063995, 2.320880176125005], "isController": false}, {"data": ["1.3 Sign-in", 1680, 1, 0.05952380952380952, 310.60773809523795, 69, 5815, 152.0, 707.8000000000002, 1150.749999999999, 1969.4700000000007, 0.4679423294503404, 189.268809601717, 2.445207846212564], "isController": false}, {"data": ["Run some searches", 28, 0, 0.0, 12293.57142857143, 9841, 19797, 11727.5, 14798.100000000008, 19528.35, 19797.0, 0.008076966568281522, 18.09729236507788, 0.17710845065608044], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 409, 0, 0.0, 2467.2713936430305, 453, 8002, 2085.0, 4076.0, 5026.5, 7584.999999999994, 0.11784352684642654, 140.9191870389444, 1.9948453046197543], "isController": true}, {"data": ["2.1 Open session", 1647, 0, 0.0, 693.9344262295082, 203, 5591, 529.0, 1304.8000000000002, 1778.3999999999992, 3061.4399999999973, 0.4600011283573519, 185.3443804919268, 1.9185672559459406], "isController": false}, {"data": ["4.3 Vaccination confirm", 1587, 0, 0.0, 1824.4700693131672, 866, 8698, 1473.0, 3109.0, 3871.9999999999973, 5861.519999999992, 0.45587846228489043, 184.1956772795216, 2.755443635795192], "isController": false}, {"data": ["4.1 Vaccination questions", 1609, 0, 0.0, 296.4623990055933, 80, 2524, 161.0, 641.0, 1032.0, 1708.4000000000024, 0.45703683336249584, 180.43319151489035, 2.6153395867644234], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 39.0, 39, 39, 39.0, 39.0, 39.0, 39.0, 25.64102564102564, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1680, 1, 0.05952380952380952, 1471.1839285714302, 286, 9447, 1169.0, 2398.3000000000006, 3103.599999999995, 5625.190000000006, 0.4678000422133847, 778.1668003832829, 9.011467929644406], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 384, 0, 0.0, 2455.8307291666665, 814, 8107, 2109.0, 4127.5, 4684.75, 7556.849999999998, 0.11069632021216795, 132.26040739542947, 1.8771561256828435], "isController": true}, {"data": ["7.0 Open Children Search", 29, 0, 0.0, 1706.3793103448277, 495, 2179, 1697.0, 2077.0, 2172.0, 2179.0, 0.008108769354444096, 3.931936143441334, 0.03378999772814652], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 28, 0, 0.0, 1964.0357142857142, 1528, 3056, 1782.0, 2522.0000000000005, 2989.8499999999995, 3056.0, 0.00814824213316323, 4.04697001659695, 0.035957471832545475], "isController": false}, {"data": ["7.2 No Consent search", 28, 0, 0.0, 2427.8214285714284, 1750, 8902, 2013.5, 3001.300000000001, 6535.449999999985, 8902.0, 0.008132062369433203, 4.320719992562793, 0.035831616191487996], "isController": false}, {"data": ["1.4 Open Sessions list", 1650, 0, 0.0, 600.395151515151, 379, 2867, 490.0, 917.9000000000001, 1252.1499999999987, 1749.5600000000004, 0.46015696093378955, 211.43237871229883, 1.9169949439208105], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1608, 0, 0.0, 278.4328358208954, 84, 3275, 165.0, 569.2000000000003, 918.55, 1540.830000000001, 0.45794665604959495, 182.00040161110076, 2.3868320151703375], "isController": false}, {"data": ["2.2 Session register", 1643, 0, 0.0, 233.93304930006107, 57, 3657, 120.0, 503.8000000000004, 827.5999999999995, 1401.6799999999998, 0.4595081836086187, 194.18431688588396, 1.9205320577051943], "isController": false}, {"data": ["7.3 Due vaccination", 28, 0, 0.0, 431.14285714285717, 259, 1092, 319.0, 945.0000000000001, 1050.1499999999996, 1092.0, 0.008150118191267555, 3.2941494608514894, 0.03568036013261989], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 80.0, 0.0209183139838929], "isController": false}, {"data": ["Assertion failed", 1, 20.0, 0.005229578495973225], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19122, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 899, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 1680, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
