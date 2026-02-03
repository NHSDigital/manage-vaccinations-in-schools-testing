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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5297160466651992, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.28173076923076923, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4558011049723757, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8849557522123894, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8802447552447552, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0035460992907801418, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.678082191780822, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4230769230769231, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.46453287197231835, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48518518518518516, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4931972789115646, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5817555938037866, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.794425087108014, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.42695652173913046, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7394, 0, 0.0, 717.2339734920212, 0, 5122, 641.0, 1351.0, 1579.75, 2249.7500000000027, 6.158382196162047, 2063.0268430404826, 21.77113693660256], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 520, 0, 0.0, 1610.0499999999997, 1056, 5122, 1452.0, 2181.8, 2520.9999999999995, 3889.1799999999876, 0.4832763160218181, 189.16285879636084, 2.5067063664800475], "isController": false}, {"data": ["4.1 Vaccination questions", 543, 0, 0.0, 1212.7458563535915, 489, 2981, 1133.0, 1481.4, 1695.999999999999, 2394.999999999992, 0.48402020227230996, 185.19071234425334, 2.403800218767326], "isController": false}, {"data": ["Get Next Patient from STS", 577, 0, 0.0, 0.6759098786828421, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.487261942562204, 0.20525849953300548, 0.3110611271479216], "isController": false}, {"data": ["2.0 Register attendance", 571, 0, 0.0, 2581.094570928194, 1590, 5299, 2443.0, 3377.8000000000006, 3788.5999999999995, 4492.119999999999, 0.487859059141163, 780.8071943792079, 7.403805898737205], "isController": true}, {"data": ["1.0 Login", 581, 0, 0.0, 3216.6282271944933, 1672, 5912, 3164.0, 3828.0, 4127.799999999999, 4628.199999999998, 0.4871688446719576, 785.4445361663647, 8.040379732025691], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 130, 0, 0.0, 3626.9692307692308, 1803, 7163, 3406.0, 4399.8, 5211.199999999997, 6990.6399999999985, 0.11796861671814939, 135.84818290472535, 1.7125158123318946], "isController": true}, {"data": ["2.5 Select patient", 565, 0, 0.0, 450.3681415929202, 312, 2507, 401.0, 623.2, 768.4999999999997, 1088.1600000000008, 0.48636918089404124, 191.68110373415317, 1.7287534209938458], "isController": false}, {"data": ["2.3 Search by first/last name", 572, 0, 0.0, 452.0751748251751, 310, 2555, 419.5, 588.7, 685.9000000000003, 1054.3699999999994, 0.49026708413651704, 193.08980042240538, 1.8128886995151328], "isController": false}, {"data": ["4.0 Vaccination for flu", 138, 0, 0.0, 3667.884057971015, 1784, 7282, 3567.5, 4432.5, 4805.199999999995, 6587.4099999999735, 0.12464897313633978, 143.0159832740611, 1.8017683048823558], "isController": true}, {"data": ["4.0 Vaccination for hpv", 141, 0, 0.0, 3564.489361702128, 1394, 6975, 3456.0, 4338.6, 4554.5, 6288.30000000002, 0.12754963580508244, 145.05705036972432, 1.8330807782698841], "isController": true}, {"data": ["1.2 Sign-in page", 584, 0, 0.0, 672.1969178082195, 177, 2021, 543.0, 1146.5, 1331.75, 1797.449999999999, 0.4887237865381702, 190.1104956610596, 2.0583187546079373], "isController": false}, {"data": ["Debug Sampler", 571, 0, 0.0, 0.5183887915936962, 0, 4, 1.0, 1.0, 1.0, 1.0, 0.48840069727539126, 2.9157748159516284, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 26, 0, 0.0, 1122.7692307692307, 742, 2303, 1021.5, 1649.3, 2079.349999999999, 2303.0, 0.026544371980577686, 10.546459645982306, 0.1162612386063388], "isController": false}, {"data": ["1.4 Open Sessions list", 578, 0, 0.0, 995.1695501730105, 532, 2460, 868.0, 1423.5, 1571.099999999999, 2025.4200000000073, 0.48722509293523614, 217.79818104563734, 1.7293547059790444], "isController": false}, {"data": ["4.2 Vaccination batch", 540, 0, 0.0, 839.535185185186, 514, 3390, 775.5, 1092.3000000000002, 1272.199999999999, 2003.970000000009, 0.48551501904747346, 187.0516607367151, 2.1716032464546164], "isController": false}, {"data": ["1.1 Homepage", 588, 0, 0.0, 731.0646258503403, 488, 2341, 677.0, 912.3000000000001, 1226.0499999999995, 1661.360000000001, 0.4902124253843332, 190.4728075851098, 2.046598936362007], "isController": false}, {"data": ["1.3 Sign-in", 581, 0, 0.0, 822.7951807228918, 403, 3253, 778.0, 1177.6000000000001, 1331.8, 1656.239999999999, 0.48808148692638875, 190.36245635566524, 2.2396525189016065], "isController": false}, {"data": ["2.2 Session register", 574, 0, 0.0, 507.1585365853664, 304, 1617, 473.0, 680.0, 810.25, 1223.75, 0.4893051866349783, 198.14638116218717, 1.744949524952007], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 131, 0, 0.0, 3551.526717557252, 1739, 5636, 3481.0, 4105.4, 4609.799999999999, 5635.36, 0.11985525876384397, 137.05564456225383, 1.725531886302191], "isController": true}, {"data": ["2.1 Open session", 575, 0, 0.0, 1120.7286956521714, 472, 3647, 1027.0, 1665.0, 1956.3999999999999, 2456.2800000000007, 0.4874302338986959, 188.71609455823352, 1.7339866982408432], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7394, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
