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

    var data = {"OkPercent": 99.95817299648652, "KoPercent": 0.0418270035134683};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8516546860165468, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.47737068965517243, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.995114006514658, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6538461538461539, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9919268030139935, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5109170305676856, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.19230769230769232, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9753410283315844, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9325452016689847, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9832460732984293, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9657894736842105, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5046296296296297, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9330117899249732, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.2692307692307692, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.7442660550458715, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9922651933701657, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.23076923076923078, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4668421052631579, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5113636363636364, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.35714285714285715, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7390139335476956, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9955604883462819, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9898068669527897, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11954, 5, 0.0418270035134683, 231.37978919190184, 0, 4620, 116.5, 527.0, 676.0, 1168.9000000000015, 5.797621588065261, 173.5060755384649, 43.94813910727103], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 13, 0, 0.0, 104.6923076923077, 75, 238, 93.0, 202.79999999999995, 238.0, 238.0, 0.008025801098423485, 0.24315669265379902, 0.05963642889510648], "isController": false}, {"data": ["2.0 Register attendance", 928, 5, 0.5387931034482759, 1012.608836206896, 364, 2879, 955.5, 1454.9, 1689.1499999999994, 2110.3600000000006, 0.5241815453075302, 76.2130991796107, 18.802568744637448], "isController": true}, {"data": ["2.5 Select patient", 921, 0, 0.0, 116.03800217155272, 56, 1016, 96.0, 194.60000000000014, 271.9, 497.1599999999994, 0.5226119019328129, 13.078237277684245, 3.768868653400496], "isController": false}, {"data": ["7.1 Full name search", 13, 0, 0.0, 649.2307692307692, 310, 1125, 590.0, 1037.0, 1125.0, 1125.0, 0.008022052003877737, 0.3066940398621935, 0.05920240632248773], "isController": false}, {"data": ["2.3 Search by first/last name", 929, 0, 0.0, 125.9817007534982, 58, 987, 92.0, 233.0, 331.5, 671.8000000000006, 0.524271691247428, 15.115054493887353, 3.920474229210568], "isController": false}, {"data": ["4.0 Vaccination for flu", 236, 0, 0.0, 795.1864406779656, 185, 1900, 745.5, 1103.3, 1216.15, 1759.6899999999996, 0.13833804425176116, 7.286251120882539, 3.92797351049933], "isController": true}, {"data": ["4.0 Vaccination for hpv", 229, 0, 0.0, 795.9781659388647, 185, 1835, 755.0, 1169.0, 1324.0, 1773.699999999999, 0.13518459485944345, 6.434315377100083, 3.792377663291479], "isController": true}, {"data": ["7.6 First name search", 13, 0, 0.0, 2170.6153846153848, 1299, 3595, 1741.0, 3577.4, 3595.0, 3595.0, 0.00803834662339975, 1.074655448638675, 0.05925744497751736], "isController": false}, {"data": ["1.2 Sign-in page", 953, 0, 0.0, 158.77019937040924, 12, 4096, 91.0, 279.0, 470.0, 1087.340000000001, 0.531238851230824, 11.039976132923988, 4.417243056581397], "isController": false}, {"data": ["2.4 Patient attending session", 719, 5, 0.6954102920723226, 376.33796940194736, 97, 1351, 339.0, 524.0, 704.0, 1087.5999999999997, 0.4093973488817018, 12.231731123735935, 3.5892981285658565], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 25.0, 25, 25, 25.0, 25.0, 25.0, 25.0, 40.0, 12.5390625, 23.59375], "isController": false}, {"data": ["1.1 Homepage", 955, 0, 0.0, 151.21047120418865, 28, 4302, 95.0, 241.5999999999999, 349.7999999999997, 1154.6799999999987, 0.5311073170460423, 27.528007721042137, 4.402632113814073], "isController": false}, {"data": ["1.3 Sign-in", 950, 0, 0.0, 193.27157894736845, 55, 4197, 102.0, 385.9, 535.2499999999997, 1154.39, 0.5300999098830153, 11.431504291019271, 4.663723972791924], "isController": false}, {"data": ["Run some searches", 13, 0, 0.0, 8829.538461538461, 6030, 14998, 7234.0, 13703.199999999999, 14998.0, 14998.0, 0.007959701866305173, 5.2914192988405775, 0.47158602646784553], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 216, 0, 0.0, 782.5185185185185, 190, 1846, 735.0, 1105.0000000000002, 1234.35, 1702.9199999999996, 0.1275117151388284, 6.316561779425985, 3.6044127797731], "isController": true}, {"data": ["2.1 Open session", 933, 0, 0.0, 332.0535905680601, 105, 2063, 281.0, 558.6, 726.8999999999999, 1157.8799999999994, 0.5240745702504268, 12.126783373664045, 3.782175376211677], "isController": false}, {"data": ["7.7 Partial name search", 13, 0, 0.0, 1952.2307692307695, 766, 4139, 1177.0, 3836.2, 4139.0, 4139.0, 0.00806361572529122, 1.077014847520128, 0.05943585025400389], "isController": false}, {"data": ["4.3 Vaccination confirm", 872, 0, 0.0, 546.2454128440368, 314, 1700, 501.5, 814.1000000000001, 968.3499999999999, 1423.3699999999994, 0.5192831510482732, 10.918845821921908, 5.352310234984558], "isController": false}, {"data": ["4.1 Vaccination questions", 905, 0, 0.0, 135.28066298342563, 70, 965, 105.0, 205.19999999999993, 310.39999999999986, 589.1999999999982, 0.5250757008310121, 7.410942193226698, 4.922144450319716], "isController": false}, {"data": ["7.7 Last name search", 13, 0, 0.0, 1750.7692307692305, 1084, 4620, 1552.0, 3554.7999999999993, 4620.0, 4620.0, 0.008040205977707602, 1.0771478202305806, 0.059283231485570305], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 37.0, 37, 37, 37.0, 37.0, 37.0, 37.0, 27.027027027027028, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 950, 0, 0.0, 1022.5884210526314, 240, 12595, 894.0, 1402.9, 1636.0999999999988, 3363.94, 0.5301288994468245, 92.81232742473286, 17.218078759157976], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 220, 0, 0.0, 777.3272727272729, 198, 1671, 739.0, 1075.0, 1265.5, 1594.8399999999992, 0.12851315536597918, 6.777983931255393, 3.615641298717439], "isController": true}, {"data": ["7.0 Open Children Search", 14, 0, 0.0, 1897.1428571428573, 477, 4171, 1186.0, 4136.5, 4171.0, 4171.0, 0.007976526222829957, 0.9940100383158134, 0.057504322102099534], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 13, 0, 0.0, 1990.6153846153845, 1718, 4093, 1809.0, 3268.999999999999, 4093.0, 4093.0, 0.008021834198560143, 1.0783594072512446, 0.05980279805433497], "isController": false}, {"data": ["7.2 No Consent search", 13, 0, 0.0, 106.07692307692308, 77, 230, 95.0, 194.39999999999998, 230.0, 230.0, 0.008024884549689776, 0.24312892409138245, 0.05977068082194571], "isController": false}, {"data": ["Debug Sampler", 929, 0, 0.0, 0.29817007534983897, 0, 5, 0.0, 1.0, 1.0, 1.0, 0.5243711215445975, 2.9494530615879246, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 933, 0, 0.0, 528.1521972132906, 313, 1396, 511.0, 768.6, 912.8999999999999, 1172.8799999999994, 0.5239262460094846, 43.065328940256684, 3.7769881856877725], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 901, 0, 0.0, 123.92563817980026, 67, 794, 99.0, 192.0, 259.0, 458.98, 0.5255948964210546, 8.503600002377135, 4.658948281367398], "isController": false}, {"data": ["2.2 Session register", 932, 0, 0.0, 147.40772532188836, 55, 2073, 95.0, 300.4000000000001, 376.0, 594.0999999999988, 0.5240306276784881, 20.84151820040039, 3.7864601811925858], "isController": false}, {"data": ["7.3 Due vaccination", 13, 0, 0.0, 105.30769230769232, 75, 293, 88.0, 220.19999999999993, 293.0, 293.0, 0.008028591667680534, 0.24324123818175866, 0.05954739856646408], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.0418270035134683], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11954, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 719, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
