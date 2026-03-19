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

    var data = {"OkPercent": 99.97925813254054, "KoPercent": 0.020741867459466934};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.739011063323325, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.49320987654320986, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9962848297213622, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8621794871794872, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.997842170160296, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5024271844660194, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7512338062924121, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3582887700534759, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.5, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9452968645763843, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.748383122882661, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.748070392096326, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4852015113350126, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.968999386126458, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.787531806615776, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9978070175438597, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.31290521765977153, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4961340206185567, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.493125, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.4605263157894737, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.47619047619047616, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.3313953488372093, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7366809552969994, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9981191222570532, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.996309963099631, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.38202247191011235, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 28927, 6, 0.020741867459466934, 630.8312303384322, 0, 15205, 194.0, 1213.0, 1891.600000000035, 6860.990000000002, 7.647326766648275, 399.59723562550676, 59.805140857390455], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1620, 6, 0.37037037037037035, 969.5697530864193, 387, 2423, 934.5, 1281.6000000000004, 1423.0, 1789.8999999999996, 0.4535455926707032, 68.54418755644824, 16.88327870532401], "isController": true}, {"data": ["2.5 Select patient", 1615, 0, 0.0, 112.1411764705883, 71, 1207, 86.0, 171.0, 245.19999999999982, 442.3599999999997, 0.45486692114804467, 11.428032452888884, 3.2803271957750044], "isController": false}, {"data": ["7.1 Full name search", 156, 0, 0.0, 501.81410256410254, 192, 2930, 370.5, 924.9000000000001, 1273.0000000000007, 2283.050000000008, 0.043839410618467294, 1.5967541500606164, 0.32350336713370625], "isController": false}, {"data": ["2.3 Search by first/last name", 1622, 0, 0.0, 107.39149198520344, 66, 1336, 85.0, 160.70000000000005, 223.0, 401.92999999999984, 0.45395136395312713, 13.166010229823373, 3.394587191476797], "isController": false}, {"data": ["4.0 Vaccination for flu", 412, 0, 0.0, 782.6189320388346, 180, 2270, 739.0, 1015.7999999999998, 1172.7999999999997, 1593.9400000000003, 0.11756051655862702, 6.160264082169808, 3.3332341587382275], "isController": true}, {"data": ["4.0 Vaccination for hpv", 407, 0, 0.0, 773.3415233415233, 180, 2158, 728.0, 1031.6, 1188.1999999999996, 1513.6000000000001, 0.11663415047926033, 5.685022941482469, 3.3153091040512743], "isController": true}, {"data": ["1.2 Sign-in page", 3242, 0, 0.0, 919.0351634793341, 12, 11673, 181.0, 1565.2000000000016, 6297.399999999998, 7169.270000000002, 0.9021154635446015, 60.3044804905705, 7.829561837830693], "isController": false}, {"data": ["7.2 First name search", 187, 0, 0.0, 1897.2192513368987, 899, 12305, 1259.0, 3826.4000000000005, 5930.4, 7421.0000000000255, 0.0551157430604269, 7.370426482469804, 0.4063070591624765], "isController": false}, {"data": ["7.7 Due vaccination search", 175, 0, 0.0, 637.7485714285713, 531, 1077, 608.0, 744.8000000000001, 870.5999999999999, 1072.44, 0.05208173678009275, 6.843695993099021, 0.39452642197649895], "isController": false}, {"data": ["2.4 Patient attending session", 1499, 6, 0.400266844563042, 362.425617078052, 59, 1927, 325.0, 503.0, 596.0, 874.0, 0.42092789468659264, 12.697236732715702, 3.6921887767888735], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 3247, 0, 0.0, 919.5497382198963, 26, 11726, 182.0, 1594.6000000000008, 6159.199999999998, 7166.5599999999995, 0.9022775352345352, 70.65224646256563, 7.817757474738591], "isController": false}, {"data": ["1.3 Sign-in", 3239, 0, 0.0, 932.4263661623953, 64, 11811, 236.0, 1611.0, 6255.0, 7295.799999999997, 0.9015290366665414, 60.562318005478346, 8.076847885327817], "isController": false}, {"data": ["Run some searches", 1588, 0, 0.0, 1782.143576826197, 0, 15205, 1120.5, 6284.6, 6774.299999999999, 7429.149999999993, 0.444374548419756, 51.03308452506561, 3.323999844203067], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 388, 0, 0.0, 781.2010309278353, 204, 2501, 726.5, 1050.3000000000002, 1188.649999999999, 1722.5200000000004, 0.11231450376818056, 5.562924831691071, 3.1895377583342137], "isController": true}, {"data": ["2.1 Open session", 1629, 0, 0.0, 287.0423572744021, 126, 1573, 260.0, 454.0, 530.0, 715.8000000000002, 0.45477196494152033, 10.315498268781678, 3.281811234825231], "isController": false}, {"data": ["4.3 Vaccination confirm", 1572, 0, 0.0, 525.3346055979646, 353, 2204, 481.5, 716.7, 867.6999999999998, 1294.7799999999997, 0.4538592326141166, 9.56789079414611, 4.678018885683195], "isController": false}, {"data": ["4.1 Vaccination questions", 1596, 0, 0.0, 134.93546365914796, 82, 1471, 109.0, 207.0, 280.0, 439.05999999999995, 0.45427815599502, 6.379074554043872, 4.25930078753644], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 41.0, 41, 41, 41.0, 41.0, 41.0, 41.0, 24.390243902439025, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3239, 0, 0.0, 3024.9854893485617, 247, 26126, 1007.0, 4589.0, 19032.0, 21461.0, 0.9017142593067407, 229.08959400230216, 26.99538872351197], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 388, 0, 0.0, 792.9793814432988, 178, 2635, 749.0, 1036.9, 1170.6499999999999, 1749.260000000001, 0.11161577936437116, 5.921146694903589, 3.172898045008632], "isController": true}, {"data": ["7.0 Open Children Search", 1600, 0, 0.0, 1743.038124999998, 81, 11637, 1070.5, 6220.000000000001, 6835.749999999999, 7548.980000000001, 0.4449980962425195, 49.86123028788804, 3.2094346949301644], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 6.241508152173913, 13.41711956521739], "isController": false}, {"data": ["7.8 Year group search", 190, 0, 0.0, 1286.1368421052634, 1128, 2364, 1223.0, 1429.6, 1707.5999999999997, 2229.3200000000006, 0.05414614100453061, 7.343289568557137, 0.41225206410789106], "isController": false}, {"data": ["7.9 DOB search", 168, 0, 0.0, 937.2202380952381, 665, 2109, 858.5, 1236.1, 1506.2499999999998, 2073.12, 0.05018901541699006, 6.770555127853529, 0.3781794475197664], "isController": false}, {"data": ["7.4 Partial name search", 172, 0, 0.0, 2314.5872093023245, 905, 15205, 1262.5, 5807.5, 6408.049999999999, 11733.120000000048, 0.04961250327384833, 6.5841928056534025, 0.365687427113608], "isController": false}, {"data": ["Debug Sampler", 1622, 0, 0.0, 0.2842170160295935, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.4539700407761376, 2.6080777384511227, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1633, 0, 0.0, 503.1132884262093, 319, 1524, 509.0, 683.0, 754.5999999999999, 967.9800000000002, 0.4551756509736522, 37.57067875673565, 3.282122312568255], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1595, 0, 0.0, 129.7442006269593, 81, 1874, 102.0, 205.4000000000001, 283.0, 387.1199999999999, 0.4550999008481407, 7.330982359083095, 4.034866824875704], "isController": false}, {"data": ["7.5 Needs Consent search", 173, 0, 0.0, 6707.699421965318, 5723, 8565, 6684.0, 7283.799999999999, 7546.299999999998, 8311.919999999996, 0.049376176251828774, 6.68389376200155, 0.3745102362271864], "isController": false}, {"data": ["2.2 Session register", 1626, 0, 0.0, 127.47539975399766, 65, 752, 87.0, 243.0, 298.64999999999986, 472.3800000000001, 0.45445906514472256, 18.497046817441472, 3.2835414232729994], "isController": false}, {"data": ["7.6 Needs triage search", 187, 0, 0.0, 175.9999999999999, 129, 465, 157.0, 238.80000000000007, 301.99999999999994, 449.1600000000001, 0.05302816334262319, 2.886360360168278, 0.40218193168838273], "isController": false}, {"data": ["7.3 Last name search", 178, 0, 0.0, 1641.028089887641, 978, 6766, 1223.0, 3240.3999999999996, 3576.1499999999996, 6367.050000000004, 0.05115967192279603, 6.849334243004274, 0.3772099568146264], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, 100.0, 0.020741867459466934], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 28927, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1499, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
