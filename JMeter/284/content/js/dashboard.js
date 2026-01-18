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

    var data = {"OkPercent": 99.89538256693137, "KoPercent": 0.10461743306861952};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7262963390691766, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9814814814814815, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.1578144078144078, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9745554874310239, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5370370370370371, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9801587301587301, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.2896039603960396, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.26976744186046514, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.35185185185185186, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9567938021454112, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.46984698469846986, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9658348187759952, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9519115890083633, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.2596899224806202, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6068818514007308, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.408890290037831, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9630893300248139, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.39611940298507464, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.27002583979328165, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4444444444444444, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5194884287454324, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9639303482587065, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9691885295912142, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21029, 22, 0.10461743306861952, 388.6802510818403, 0, 9455, 152.0, 1003.0, 1312.9500000000007, 2022.9900000000016, 5.50230765144952, 2297.1144352729866, 41.40179080396842], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 130.81481481481484, 91, 715, 101.0, 146.6, 488.5999999999988, 715.0, 0.007846588158161643, 3.551447024831691, 0.05766964169209058], "isController": false}, {"data": ["2.0 Register attendance", 1638, 22, 1.343101343101343, 1890.4078144078162, 476, 6539, 1838.0, 2899.7000000000007, 3303.05, 3972.7599999999984, 0.458283217349629, 969.5419256575371, 15.875352049047777], "isController": true}, {"data": ["2.5 Select patient", 1631, 0, 0.0, 162.63580625383193, 66, 1956, 104.0, 280.39999999999986, 487.39999999999986, 1128.2800000000013, 0.4585086240946141, 205.4705704242786, 3.268526357130006], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1167.6666666666665, 341, 5295, 768.0, 3416.5999999999985, 5232.599999999999, 5295.0, 0.007839058894849477, 3.5952768472524532, 0.05719864815792278], "isController": false}, {"data": ["2.3 Search by first/last name", 1638, 0, 0.0, 164.6849816849817, 77, 2188, 119.0, 262.10000000000014, 418.0999999999999, 912.7599999999984, 0.4583718341421535, 207.0661942827593, 3.389661014282704], "isController": false}, {"data": ["4.0 Vaccination for flu", 404, 0, 0.0, 1596.314356435643, 437, 4507, 1432.0, 2304.0, 2699.25, 3508.699999999999, 0.11512785746487318, 151.2722849947188, 3.233606275764845], "isController": true}, {"data": ["4.0 Vaccination for hpv", 430, 0, 0.0, 1633.0837209302335, 223, 4451, 1461.0, 2464.600000000001, 2817.8999999999996, 3733.3599999999997, 0.1229375088629367, 161.27698822294403, 3.4538432061087363], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2321.222222222222, 699, 9455, 1224.0, 6385.799999999998, 8868.599999999997, 9455.0, 0.007835050708738375, 4.33046806329952, 0.057120659581410965], "isController": false}, {"data": ["1.2 Sign-in page", 1678, 0, 0.0, 208.42908224076265, 17, 7446, 123.0, 419.5000000000007, 661.0999999999999, 1345.090000000001, 0.4666716355978681, 207.9813546686875, 3.913289433874882], "isController": false}, {"data": ["2.4 Patient attending session", 1111, 22, 1.9801980198019802, 810.8460846084604, 61, 2550, 683.0, 1299.8000000000002, 1590.599999999994, 2260.919999999996, 0.31453903610630685, 142.4323182586867, 2.7205692383299933], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.610243055555555, 21.846064814814817], "isController": false}, {"data": ["1.1 Homepage", 1683, 0, 0.0, 191.74866310160434, 25, 6735, 121.0, 349.2000000000003, 560.5999999999999, 1161.920000000001, 0.4676270386788411, 208.20868521278143, 3.9130487219861396], "isController": false}, {"data": ["1.3 Sign-in", 1674, 0, 0.0, 230.98745519713273, 74, 6386, 129.0, 464.5, 706.75, 1224.25, 0.4661831988577676, 207.94403925758934, 4.067753927207053], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 9218.296296296297, 4962, 23236, 6860.0, 18227.8, 21262.79999999999, 23236.0, 0.007771884258796838, 31.306337446741004, 0.4554431556289599], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 387, 0, 0.0, 1641.994832041344, 237, 4108, 1492.0, 2394.0, 2689.9999999999977, 3441.8400000000015, 0.11197599142153955, 147.75109775171305, 3.1506423460612227], "isController": true}, {"data": ["2.1 Open session", 1642, 0, 0.0, 821.3861144945193, 124, 4304, 696.0, 1561.7, 1788.0, 2176.2799999999997, 0.45814911107353656, 204.25980983969384, 3.269449198811045], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1609.8518518518517, 519, 7805, 929.0, 3704.7999999999993, 6537.399999999993, 7805.0, 0.00784721073800692, 4.337465128957283, 0.057216690534055], "isController": false}, {"data": ["4.3 Vaccination confirm", 1586, 0, 0.0, 1213.2440100882716, 762, 4074, 1067.5, 1785.3, 2134.95, 2858.339999999998, 0.45636860080437125, 203.25345370642665, 4.650825090457235], "isController": false}, {"data": ["4.1 Vaccination questions", 1612, 0, 0.0, 218.11290322580675, 87, 2263, 138.0, 407.4000000000001, 665.3999999999996, 1245.2199999999993, 0.4578683049187042, 199.70634320820753, 4.247472406564474], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1599.8518518518517, 794, 4079, 1272.0, 3192.4, 3777.7999999999984, 4079.0, 0.00784289575978198, 4.337320491184585, 0.05722267293657769], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1675, 0, 0.0, 1301.7797014925377, 344, 20567, 1154.0, 1868.4, 2204.7999999999993, 3057.4800000000005, 0.46624173255984525, 853.9286993545788, 15.134058491886838], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 387, 0, 0.0, 1612.7441860465103, 215, 4027, 1475.0, 2340.7999999999997, 2680.9999999999995, 3340.04, 0.11131683792297163, 146.15441914857792, 3.1235318541437334], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1161.4074074074074, 451, 6492, 744.0, 2293.1999999999994, 5031.999999999993, 6492.0, 0.007809273251677259, 4.274722966031397, 0.055664233101889615], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2147.8518518518517, 1770, 5579, 1978.0, 2301.7999999999997, 4390.999999999994, 5579.0, 0.007838615108320951, 4.336445887263731, 0.05780241504102499], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 119.85185185185183, 92, 212, 112.0, 181.6, 205.59999999999997, 212.0, 0.007844768875676103, 3.5506235987463186, 0.05779416693857023], "isController": false}, {"data": ["Debug Sampler", 1638, 0, 0.0, 0.3113553113553114, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.4584154497760817, 2.6412649918189075, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1642, 0, 0.0, 684.8191230207071, 461, 2295, 623.0, 889.7, 1069.2499999999995, 1604.1399999999999, 0.4583555253334941, 231.3518181223572, 3.267009827915694], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1608, 0, 0.0, 206.55223880597018, 83, 1609, 131.0, 400.10000000000014, 631.9499999999996, 1181.3000000000025, 0.4576695511992195, 200.93655260330507, 4.0120692955603205], "isController": false}, {"data": ["2.2 Session register", 1639, 0, 0.0, 193.1592434411227, 75, 3137, 121.0, 402.0, 539.0, 1026.3999999999987, 0.45787839990076973, 210.12000283930354, 3.2715379698771048], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 121.18518518518519, 89, 325, 113.0, 152.4, 256.5999999999996, 325.0, 0.007844417883180929, 3.5504647359096824, 0.057546443039502744], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, 100.0, 0.10461743306861952], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21029, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1111, 22, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
