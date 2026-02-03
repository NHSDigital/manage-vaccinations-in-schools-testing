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

    var data = {"OkPercent": 99.9719927181067, "KoPercent": 0.028007281893292255};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8450267098036265, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.47332942555685814, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9970536240424278, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5925925925925926, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9959136018680678, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4901234567901235, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.484304932735426, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3333333333333333, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9883124287343216, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8165064102564102, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9889078498293515, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.988013698630137, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.48905109489051096, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7681791739383362, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6012048192771084, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9928400954653938, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4914383561643836, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4975728155339806, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.625, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9587209302325581, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9922341696535245, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9956268221574344, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21423, 6, 0.028007281893292255, 230.40470522335735, 0, 8366, 108.0, 546.0, 719.0, 1082.0, 5.548930465216031, 2175.8187708504984, 41.60224687262351], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 104.11111111111111, 73, 264, 89.0, 206.59999999999997, 249.99999999999991, 264.0, 0.00798615968947445, 3.392526875276003, 0.058695442975270413], "isController": false}, {"data": ["2.0 Register attendance", 1706, 5, 0.29308323563892147, 1077.1535756154744, 412, 4197, 1058.0, 1379.0, 1568.549999999999, 2066.1000000000045, 0.4783732393635561, 888.7585109790829, 15.277456314530264], "isController": true}, {"data": ["2.5 Select patient", 1697, 0, 0.0, 99.90335886859172, 53, 954, 88.0, 134.0, 179.0, 410.49999999999955, 0.47620864954298564, 200.77873200204206, 3.3947147302882734], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 977.9629629629629, 313, 4732, 618.0, 2063.9999999999986, 4344.799999999997, 4732.0, 0.007985545570994606, 3.432242248401338, 0.05826808369310188], "isController": false}, {"data": ["2.3 Search by first/last name", 1713, 0, 0.0, 106.58960887332161, 64, 923, 92.0, 134.60000000000014, 175.0, 469.4399999999996, 0.47916365382845605, 203.63888222533964, 3.543365165134537], "isController": false}, {"data": ["4.0 Vaccination for flu", 405, 0, 0.0, 871.0246913580254, 203, 2410, 801.0, 1136.0, 1373.5, 1815.1799999999998, 0.11664642395185987, 144.56445367234264, 3.288000608019485], "isController": true}, {"data": ["4.0 Vaccination for hpv", 446, 0, 0.0, 860.2219730941702, 198, 1968, 784.0, 1147.6, 1370.5499999999997, 1839.3299999999983, 0.12718459503683507, 157.21807487543896, 3.5825227870023046], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2007.2222222222224, 716, 8366, 1273.0, 5195.4, 7291.9999999999945, 8366.0, 0.007983604632974475, 4.124413373694644, 0.05819183810964801], "isController": false}, {"data": ["1.2 Sign-in page", 1754, 0, 0.0, 134.04275940706978, 17, 5541, 99.0, 184.5, 332.5, 757.0500000000013, 0.4877121019334976, 204.42432647712954, 4.094200558898188], "isController": false}, {"data": ["2.4 Patient attending session", 624, 5, 0.8012820512820513, 508.96314102564145, 198, 1664, 471.0, 651.0, 788.5, 1091.75, 0.18741237570414795, 80.0658931701404, 1.6241649177472912], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 9.499289772727272, 17.87405303030303], "isController": false}, {"data": ["1.1 Homepage", 1758, 0, 0.0, 129.3606370875995, 36, 5651, 99.0, 165.0, 252.0, 688.8200000000002, 0.4883547666814265, 204.47960643567828, 4.0911110864379605], "isController": false}, {"data": ["1.3 Sign-in", 1752, 0, 0.0, 144.32648401826464, 61, 5232, 103.5, 238.80000000000018, 315.0, 697.2900000000002, 0.4877990379333358, 204.66991637558007, 4.257079602914321], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8199.370370370369, 4708, 17708, 5923.0, 17447.0, 17680.4, 17708.0, 0.00796222954223078, 30.031529772379763, 0.46652594378223594], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 411, 0, 0.0, 892.1167883211677, 193, 3475, 811.0, 1213.0, 1384.1999999999994, 1798.1199999999997, 0.11889440354496247, 147.53189632559884, 3.3461004131761323], "isController": true}, {"data": ["2.1 Open session", 1719, 0, 0.0, 561.2722513089006, 120, 3810, 472.0, 917.0, 1041.0, 1395.3999999999999, 0.4796986186688991, 201.14734143906097, 3.423080340013255], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1316.111111111111, 364, 4683, 765.0, 4670.4, 4680.2, 4683.0, 0.008007696879608133, 4.1383521440682545, 0.05835962449907407], "isController": false}, {"data": ["4.3 Vaccination confirm", 1660, 0, 0.0, 616.6765060240949, 430, 3268, 557.0, 813.0, 984.8499999999995, 1423.1699999999996, 0.4773546958186604, 200.02987499471604, 4.864740677510814], "isController": false}, {"data": ["4.1 Vaccination questions", 1676, 0, 0.0, 135.22494033412897, 71, 1359, 113.0, 175.29999999999995, 261.8999999999992, 598.5300000000002, 0.47579654757937084, 194.99787152638, 4.413898022300266], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1587.7407407407409, 391, 5292, 1056.0, 4541.599999999999, 5159.199999999999, 5292.0, 0.0079957758612265, 4.133445656246641, 0.058304556714926604], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1752, 1, 0.05707762557077625, 792.4948630136994, 292, 15811, 700.0, 995.0, 1213.4499999999994, 1946.720000000002, 0.4879214379646324, 842.6274824539224, 15.85500012079676], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 412, 0, 0.0, 844.635922330097, 203, 1890, 786.5, 1071.5, 1272.9999999999986, 1579.5800000000002, 0.11817730439289709, 146.0608658025716, 3.320337206173789], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1028.9285714285716, 289, 4640, 599.0, 4435.0, 4620.65, 4640.0, 0.007969991842144065, 4.079676822345751, 0.05681037537451846], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 49.0, 49, 49, 49.0, 49.0, 49.0, 49.0, 20.408163265306122, 5.859375, 12.595663265306122], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1988.111111111111, 1770, 2498, 1899.0, 2445.4, 2488.7999999999997, 2498.0, 0.0079842774790738, 4.1292983343947, 0.0588765380453779], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 96.77777777777777, 74, 231, 92.0, 115.39999999999996, 199.79999999999984, 231.0, 0.007987558342457395, 3.3931210241558554, 0.05884612887792259], "isController": false}, {"data": ["Debug Sampler", 1713, 0, 0.0, 0.3327495621716289, 0, 5, 0.0, 1.0, 1.0, 1.0, 0.4791824191243298, 2.6713194942135856, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1720, 1, 0.05813953488372093, 391.98255813953466, 288, 2368, 363.0, 485.0, 539.8999999999996, 840.6499999999987, 0.47977591117674245, 229.45947857676776, 3.419337160638738], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1674, 0, 0.0, 120.09617682198328, 67, 861, 98.0, 162.0, 231.5, 589.25, 0.4761490295263597, 196.48656100519, 4.174108272989835], "isController": false}, {"data": ["2.2 Session register", 1715, 0, 0.0, 122.21224489795898, 61, 1236, 92.0, 228.4000000000001, 299.0, 488.67999999999984, 0.4791639134532184, 207.14355567930076, 3.4234708568107353], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 121.33333333333334, 74, 696, 88.0, 187.79999999999995, 509.99999999999903, 696.0, 0.007989418459107493, 3.3939112031620344, 0.05861016344648717], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 83.33333333333333, 0.023339401577743547], "isController": false}, {"data": ["Assertion failed", 1, 16.666666666666668, 0.00466788031554871], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21423, 6, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 624, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1720, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
