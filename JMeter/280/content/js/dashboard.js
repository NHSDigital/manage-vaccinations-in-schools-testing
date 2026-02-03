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

    var data = {"OkPercent": 99.91975454330894, "KoPercent": 0.080245456691055};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7962616107946944, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.30218446601941745, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9878197320341048, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5370370370370371, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9893875075803518, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4666666666666667, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.45127610208816704, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4074074074074074, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9703791469194313, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6244503078276166, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9754437869822485, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9676749703440095, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4462915601023018, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7419939577039275, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5618330194601381, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9846153846153847, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2962962962962963, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4540059347181009, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4383033419023136, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5370370370370371, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7456246228123115, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9814356435643564, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9812348668280871, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21185, 17, 0.080245456691055, 291.8039650696263, 0, 17988, 127.0, 713.0, 916.0, 1630.9900000000016, 5.595118869535086, 2336.0789058752976, 42.10460602198933], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 103.0, 77, 172, 100.0, 132.79999999999995, 170.39999999999998, 172.0, 0.007773627364550302, 3.5182960035169906, 0.05713340572043963], "isController": false}, {"data": ["2.0 Register attendance", 1648, 17, 1.0315533980582525, 1479.7609223300988, 385, 5961, 1389.0, 2240.0, 2627.0, 3710.7299999999996, 0.46126210043310495, 978.7022435718242, 16.026959698745888], "isController": true}, {"data": ["2.5 Select patient", 1642, 0, 0.0, 123.22472594397067, 52, 1771, 95.0, 179.70000000000005, 304.6999999999998, 825.2699999999993, 0.4620086515481229, 207.0242382950657, 3.293475678846025], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 1385.037037037037, 245, 6835, 607.0, 5005.4, 6244.599999999997, 6835.0, 0.007762417136197071, 3.57897096196545, 0.0566368954011416], "isController": false}, {"data": ["2.3 Search by first/last name", 1649, 0, 0.0, 135.39963614311682, 62, 1696, 110.0, 186.0, 263.0, 733.5, 0.46157713264590344, 208.64765180068966, 3.4133723211241653], "isController": false}, {"data": ["4.0 Vaccination for flu", 405, 0, 0.0, 1028.024691358026, 191, 2785, 948.0, 1468.6000000000001, 1669.4, 2592.2599999999993, 0.1154811787064112, 151.47659388753488, 3.2376935579501662], "isController": true}, {"data": ["4.0 Vaccination for hpv", 431, 0, 0.0, 1030.8955916473317, 226, 2718, 924.0, 1518.4, 1768.0, 2129.48, 0.12313990178521429, 161.53542644217612, 3.4596337656646243], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2151.740740740741, 491, 17988, 1227.0, 4023.399999999998, 13442.799999999976, 17988.0, 0.007780376679732897, 4.287895655117082, 0.056714465975116056], "isController": false}, {"data": ["1.2 Sign-in page", 1688, 0, 0.0, 174.56753554502356, 16, 5733, 107.0, 284.10000000000014, 522.55, 1341.8699999999983, 0.46960399141136583, 209.20195703438193, 3.938432796309547], "isController": false}, {"data": ["2.4 Patient attending session", 1137, 17, 1.4951627088830255, 649.5892700087949, 108, 3635, 566.0, 990.2, 1196.099999999999, 1833.7999999999956, 0.31914589037212354, 144.6926819761376, 2.7626318318833762], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1690, 0, 0.0, 162.29585798816538, 31, 6605, 107.0, 231.0, 433.4999999999982, 1086.3399999999979, 0.46972823858859175, 209.05657411074748, 3.93102679657154], "isController": false}, {"data": ["1.3 Sign-in", 1686, 0, 0.0, 187.7402135231316, 59, 5416, 115.0, 321.29999999999995, 550.5999999999967, 1145.5699999999777, 0.4694103693474472, 209.32326698941532, 4.096023532466159], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8879.74074074074, 4346, 32469, 6533.0, 16156.399999999996, 27650.199999999975, 32469.0, 0.007751156860161379, 31.025296631569713, 0.4520487689153347], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 391, 0, 0.0, 1069.5780051150884, 206, 3342, 961.0, 1557.0, 1942.599999999999, 2573.7599999999975, 0.1130160693820391, 148.8620907345069, 3.1741512526610083], "isController": true}, {"data": ["2.1 Open session", 1655, 0, 0.0, 612.59758308157, 122, 4168, 479.0, 1213.4, 1459.1999999999998, 2057.0400000000022, 0.4619712522686836, 205.9521650030642, 3.2967408224735197], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1500.6923076923076, 222, 5882, 739.5, 5332.500000000001, 5877.1, 5882.0, 0.007817378814843278, 4.2753231231788895, 0.05697607758056937], "isController": false}, {"data": ["4.3 Vaccination confirm", 1593, 0, 0.0, 750.5455116133086, 433, 3146, 670.0, 1117.6000000000001, 1409.3, 1958.2999999999997, 0.4603233359658164, 205.00070911881602, 4.691160108269176], "isController": false}, {"data": ["4.1 Vaccination questions", 1625, 0, 0.0, 159.2061538461538, 78, 1341, 120.0, 238.4000000000001, 367.6999999999998, 773.8000000000002, 0.4625993414293437, 201.76190405773283, 4.291325309126672], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1510.3703703703702, 680, 5221, 1365.0, 2562.599999999999, 4617.7999999999965, 5221.0, 0.007819389479445866, 4.323050213965285, 0.05699630144687666], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1685, 0, 0.0, 1042.8545994065291, 386, 17754, 897.0, 1459.8000000000002, 1788.4999999999973, 3037.75999999997, 0.46907684007569816, 859.7336272195721, 15.240091058410647], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 1085.9460154241658, 219, 3151, 969.0, 1626.0, 1910.5, 2742.8, 0.11204681886407569, 147.49412854596497, 3.1529237743366987], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 1344.4814814814815, 167, 5668, 616.0, 4895.799999999999, 5603.599999999999, 5668.0, 0.007761930662385914, 4.207262320160378, 0.05532677674186348], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2054.074074074074, 1705, 4120, 1900.0, 2493.7999999999997, 3557.199999999997, 4120.0, 0.0077747309151232616, 4.300959039604047, 0.05733132919247325], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 111.4814814814815, 83, 228, 105.0, 149.2, 203.19999999999987, 228.0, 0.007773258092033649, 3.518128873043838, 0.05726733100073212], "isController": false}, {"data": ["Debug Sampler", 1649, 0, 0.0, 0.30503335354760513, 0, 14, 0.0, 1.0, 1.0, 1.0, 0.4615974181896256, 2.6588022878394413, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1657, 0, 0.0, 526.6976463488236, 305, 2404, 501.0, 781.2, 867.0, 1306.300000000001, 0.46215309232574847, 233.26131124792283, 3.2940868874135663], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1616, 0, 0.0, 153.82178217821772, 67, 1465, 111.0, 259.29999999999995, 403.8999999999992, 835.9799999999996, 0.460743170751248, 202.27663214606315, 4.039018710599117], "isController": false}, {"data": ["2.2 Session register", 1652, 0, 0.0, 161.04963680387385, 61, 2942, 112.0, 296.70000000000005, 443.6999999999998, 845.1600000000008, 0.46165793885379725, 211.98467402010166, 3.2985588105265835], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 118.92592592592594, 80, 524, 98.0, 143.19999999999996, 387.99999999999926, 524.0, 0.007777021838453397, 3.519832321558394, 0.05705202742998808], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, 100.0, 0.080245456691055], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21185, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1137, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
