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

    var data = {"OkPercent": 99.92936946192371, "KoPercent": 0.07063053807628097};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7539784065905951, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.95, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.2130637636080871, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9828926905132193, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9902799377916018, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.35173501577287064, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.36728395061728397, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9600580973129993, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5566666666666666, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9651416122004357, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9567901234567902, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.37306501547987614, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6648522550544324, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.4510108864696734, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.973950233281493, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.43391430646332607, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.36024844720496896, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.07142857142857142, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.05, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8499262536873157, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9712286158631416, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.97900466562986, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 15574, 11, 0.07063053807628097, 417.36426094773356, 3, 15702, 175.0, 851.0, 1169.25, 5578.5, 4.256021529883152, 1791.5509716026227, 20.571607550711395], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 20, 0, 0.0, 192.30000000000004, 92, 667, 137.5, 583.3000000000006, 664.4, 667.0, 0.005911568259253009, 2.51095593716535, 0.025893996769180156], "isController": false}, {"data": ["2.0 Register attendance", 1286, 11, 0.8553654743390358, 1686.410575427683, 588, 7397, 1599.5, 2506.9999999999995, 2793.199999999999, 3857.6499999999996, 0.4266527235937297, 843.4975474544367, 8.702437544498286], "isController": true}, {"data": ["2.5 Select patient", 1286, 0, 0.0, 151.90513219284603, 75, 1674, 100.0, 266.0, 425.64999999999986, 800.249999999997, 0.4269895938718028, 177.89083015775043, 1.7762412897318631], "isController": false}, {"data": ["7.1 Full name search", 20, 0, 0.0, 8809.75, 7313, 11514, 8444.5, 10586.7, 11469.599999999999, 11514.0, 0.005869743351341706, 2.8960419476806294, 0.0254858065570316], "isController": false}, {"data": ["2.3 Search by first/last name", 1286, 0, 0.0, 140.24183514774504, 69, 1982, 100.0, 245.29999999999995, 349.64999999999986, 643.3399999999979, 0.42698562426393954, 180.26449594508918, 1.846163295729712], "isController": false}, {"data": ["4.0 Vaccination for flu", 317, 0, 0.0, 1363.5678233438496, 766, 3680, 1239.0, 1958.0, 2311.7, 3142.16, 0.11168771410481944, 136.81438755980312, 1.8908694077089536], "isController": true}, {"data": ["4.0 Vaccination for hpv", 324, 0, 0.0, 1349.1481481481487, 762, 5777, 1216.0, 1968.5, 2278.5, 3875.75, 0.1221367139569468, 149.3700808990808, 2.0706792311512707], "isController": true}, {"data": ["7.6 First name search", 20, 0, 0.0, 6899.3, 5877, 8355, 6642.0, 8063.9, 8340.55, 8355.0, 0.0059005126365378625, 2.8532038336146894, 0.025564662464124883], "isController": false}, {"data": ["1.2 Sign-in page", 1377, 0, 0.0, 265.4277414669572, 14, 9160, 121.0, 339.20000000000005, 576.5999999999995, 6158.180000000002, 0.3872731414686005, 159.8667523076958, 1.9208459212045403], "isController": false}, {"data": ["2.4 Patient attending session", 900, 11, 1.2222222222222223, 774.0022222222219, 131, 4648, 635.5, 1230.8, 1486.4499999999994, 2526.84, 0.298925561888718, 126.75511827768308, 1.5233857718656576], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 8.928571428571427, 16.85267857142857], "isController": false}, {"data": ["1.1 Homepage", 1377, 0, 0.0, 274.6252723311549, 28, 8784, 135.0, 340.0, 515.0, 6312.88, 0.3879061182682654, 160.123041964991, 1.9159937445384678], "isController": false}, {"data": ["1.3 Sign-in", 1377, 0, 0.0, 292.1677559912856, 83, 7908, 130.0, 423.0, 610.2999999999997, 6217.000000000002, 0.3864368251562796, 159.71303164223374, 2.017788753306252], "isController": false}, {"data": ["Run some searches", 20, 0, 0.0, 34535.24999999999, 29644, 47988, 32977.5, 38722.9, 47524.99999999999, 47988.0, 0.005830519621739209, 22.953240612826967, 0.20343303591731274], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 323, 0, 0.0, 1288.0402476780187, 736, 4363, 1133.0, 1962.2000000000003, 2346.8000000000006, 2864.3999999999996, 0.1087730700778081, 133.75545535989406, 1.8447935968905382], "isController": true}, {"data": ["2.1 Open session", 1286, 0, 0.0, 693.3786936236393, 239, 2827, 584.0, 1172.4999999999998, 1403.2999999999997, 1832.6899999999866, 0.4268735133283454, 177.10216611545437, 1.7796431275397482], "isController": false}, {"data": ["7.7 Partial name search", 20, 0, 0.0, 6594.85, 3327, 8062, 6539.0, 7725.5, 8045.75, 8062.0, 0.0058960039243802125, 2.8003724150997544, 0.025539370124004753], "isController": false}, {"data": ["4.3 Vaccination confirm", 1286, 0, 0.0, 946.1345256609649, 525, 5287, 802.0, 1493.3, 1792.2999999999997, 2338.5099999999966, 0.4266859902996955, 176.60053963097053, 2.574919942978859], "isController": false}, {"data": ["4.1 Vaccination questions", 1286, 0, 0.0, 189.18740279937802, 93, 1244, 133.0, 355.89999999999986, 507.0, 805.5199999999995, 0.4274758614087357, 173.02190439052364, 2.4424347975697365], "isController": false}, {"data": ["7.7 Last name search", 20, 0, 0.0, 7005.25, 5765, 8903, 6746.0, 8683.100000000002, 8895.25, 8903.0, 0.005895103703716804, 2.9084803825502274, 0.025559361981031915], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1377, 0, 0.0, 1310.0479302832243, 450, 25106, 919.0, 1625.4000000000003, 1998.4999999999995, 19150.520000000008, 0.3863569152276251, 658.864200827069, 7.424162593481819], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 322, 0, 0.0, 1309.45652173913, 734, 4168, 1173.5, 1946.1999999999998, 2152.399999999999, 2924.0099999999907, 0.10786864948450846, 132.30135594053925, 1.82967511981125], "isController": true}, {"data": ["7.0 Open Children Search", 21, 0, 0.0, 6166.380952380952, 240, 8339, 6197.0, 8146.2, 8323.1, 8339.0, 0.005885132306181575, 2.721793778168065, 0.024474312308277804], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 20, 0, 0.0, 1694.45, 1473, 2395, 1569.0, 2269.1000000000004, 2389.5499999999997, 2395.0, 0.005911187365428125, 3.0266664745530774, 0.02603664446646362], "isController": false}, {"data": ["7.2 No Consent search", 20, 0, 0.0, 2823.2000000000003, 1730, 15702, 1851.5, 4427.900000000003, 15144.649999999992, 15702.0, 0.005885565767666114, 3.2201864389980237, 0.025883557226385936], "isController": false}, {"data": ["1.4 Open Sessions list", 1356, 0, 0.0, 485.2271386430676, 272, 3474, 371.0, 807.5999999999999, 1039.1499999999999, 1668.9400000000037, 0.4299592838704706, 203.6558412255647, 1.7879688916451872], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.05208333333333, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1286, 0, 0.0, 192.0940902021773, 86, 2171, 131.0, 353.0, 538.5999999999995, 904.8899999999937, 0.42741832022605974, 174.1269663766609, 2.223958984210117], "isController": false}, {"data": ["2.2 Session register", 1286, 0, 0.0, 159.20373250388812, 70, 3866, 96.0, 310.5999999999999, 436.2999999999997, 875.209999999998, 0.4269839230260211, 182.14076527530005, 1.7838562158823743], "isController": false}, {"data": ["7.3 Due vaccination", 20, 0, 0.0, 516.1500000000001, 360, 1038, 454.0, 833.7000000000003, 1028.55, 1038.0, 0.005911190859643798, 3.000289863094603, 0.02581152661159013], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, 100.0, 0.07063053807628097], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 15574, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 900, 11, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
